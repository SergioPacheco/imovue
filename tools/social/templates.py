"""Sistema de temas dos anúncios Imovue.

Três temas gráficos com os mesmos componentes e identidade — só muda a
hierarquia visual, para os posts não terem sempre a mesma cara:

- ``premium``: navy/âmbar atual (base, sempre elegível);
- ``claro``: fundo claro com texto navy (sempre elegível);
- ``desconto-hero``: desconto gigante como protagonista (só com desconto ≥40%).

A seleção é DETERMINÍSTICA (hash de imóvel + data): reproduzível, auditável
e sem repetição do tema do dia anterior na mesma UF. O tema escolhido é
gravado no ``published.json`` para futura análise de performance por tema.
Fotos reais de imóveis NÃO são usadas (qualidade imprevisível).
"""

from __future__ import annotations

import hashlib

THEMES = ("premium", "claro", "desconto-hero")

HERO_MIN_DISCOUNT = 40.0


def discount_of(imovel: dict) -> float:
    try:
        return float(imovel.get("percentualDesconto") or 0)
    except (TypeError, ValueError):
        return 0.0


def eligible_themes(imovel: dict) -> list[str]:
    """Temas válidos para o imóvel (hero só com desconto real alto)."""
    themes = ["premium", "claro"]
    if discount_of(imovel) >= HERO_MIN_DISCOUNT:
        themes.append("desconto-hero")
    return themes


def _stable_index(key: str, size: int) -> int:
    digest = hashlib.sha256(key.encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big") % size


def last_template_for_uf(state: list, uf: str) -> str | None:
    """Tema do último post PUBLICADO do escopo (registros antigos sem campo = None)."""
    scope = str(uf or "").upper()
    for item in reversed(state or []):
        if not isinstance(item, dict):
            continue
        if str(item.get("uf") or "").upper() != scope:
            continue
        if item.get("status") != "published":
            continue
        return item.get("template") or None
    return None


def select_template(imovel: dict, scope_uf: str, date_str: str,
                    last_template: str | None = None) -> str:
    """Escolhe o tema do post. Pesos: premium 40 / claro 35 / hero 25."""
    eligible = eligible_themes(imovel)
    weights = {"premium": 40, "claro": 35, "desconto-hero": 25}
    pool = [theme for theme in eligible for _ in range(weights.get(theme, 0))]
    property_id = str(imovel.get("numeroImovel") or "").strip()
    chosen = pool[_stable_index(f"{property_id}|{date_str}", len(pool))]
    # Evita repetir o tema do dia anterior no mesmo escopo.
    if last_template and chosen == last_template and len(eligible) > 1:
        ordered = [theme for theme in ("premium", "claro", "desconto-hero") if theme in eligible]
        chosen = ordered[(ordered.index(chosen) + 1) % len(ordered)]
    return chosen


def select_body_variant(imovel: dict) -> str:
    """Corpo da legenda: detalhado / comparativo / compacto (estável por imóvel)."""
    property_id = str(imovel.get("numeroImovel") or "").strip()
    options = ["detalhado", "comparativo", "compacto"]
    variant = options[_stable_index(f"body|{property_id}", len(options))]
    if variant == "comparativo" and not imovel.get("valorAvaliacao"):
        return "detalhado"
    return variant
