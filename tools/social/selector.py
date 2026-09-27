from __future__ import annotations

import random
from datetime import timedelta

from .config import DATA_DIR, DEFAULT_MIN_DISCOUNT, DEFAULT_RECENT_DAYS, STATE_FILE
from .ranking import rank_property
from .utils import now_utc, parse_datetime, read_json


def load_properties(uf: str) -> list[dict]:
    if uf.upper() == "BR":
        properties = []
        for path in sorted(DATA_DIR.glob("*.json")):
            if len(path.stem) == 2 and path.stem.upper() not in {"BR"}:
                properties.extend(read_json(path, []))
        return properties
    path = DATA_DIR / f"{uf.upper()}.json"
    if not path.exists():
        return []
    return read_json(path, [])


def load_bairro_stats() -> dict:
    return read_json(DATA_DIR / "estatisticas_bairros.json", {})


def median_for(imovel: dict, stats: dict) -> float | None:
    uf = str(imovel.get("uf", "")).upper()
    city = imovel.get("cidade", "")
    bairro = imovel.get("bairro", "")
    value = stats.get(uf, {}).get(city, {}).get(bairro, {}).get("medianaM2")
    return float(value) if value else None


def local_recent_ids(days: int = DEFAULT_RECENT_DAYS) -> set[str]:
    state = read_json(STATE_FILE, [])
    cutoff = now_utc() - timedelta(days=days)
    return {
        str(item.get("property_id"))
        for item in state
        if item.get("property_id") and (parse_datetime(item.get("published_at")) or now_utc()) >= cutoff
    }


def candidates(uf: str, minimum_discount: float = DEFAULT_MIN_DISCOUNT, recent_ids: set[str] | None = None) -> list[tuple[dict, object]]:
    stats = load_bairro_stats()
    recent_ids = recent_ids or set()
    result = []
    for imovel in load_properties(uf):
        property_id = str(imovel.get("numeroImovel") or "").strip()
        discount = float(imovel.get("percentualDesconto") or 0)
        if not property_id or not imovel.get("cidade") or not imovel.get("precoVenda") or float(imovel.get("precoVenda")) <= 0:
            continue
        if not imovel.get("modalidadeVenda"):
            continue
        if discount < minimum_discount or property_id in recent_ids:
            continue
        result.append((imovel, rank_property(imovel, median_for(imovel, stats))))
    return sorted(result, key=lambda item: (item[1].total, float(item[0].get("percentualDesconto") or 0)), reverse=True)


def price_band(price: object) -> str:
    try:
        value = float(price or 0)
    except (TypeError, ValueError):
        return ""
    if value < 100_000:
        return "ate100k"
    if value < 300_000:
        return "100a300k"
    if value < 600_000:
        return "300a600k"
    return "acima600k"


def weighted_pick(
    ranked: list[tuple[dict, object]],
    top_n: int = 20,
    rng: random.Random | None = None,
    recent_cities: set[str] | None = None,
    recent_ufs: set[str] | None = None,
    city_penalty: float = 0.2,
    uf_penalty: float = 0.5,
    same_day: list[dict] | None = None,
) -> tuple[tuple[dict, object], int]:
    """Sorteio ponderado pelo score dentro do top-N.

    Aplica penalidade de diversidade quando a cidade/UF do imóvel apareceu
    em publicações recentes (anti-repetição), sem excluir o candidato.
    `same_day` recebe os imóveis já publicados hoje e penaliza repetição de
    UF, cidade, bairro, tipo e faixa de preço no mesmo dia.
    Retorna ((imovel, ranking), indice_no_ranking).
    """
    if not ranked:
        raise ValueError("lista de candidatos vazia")
    pool = ranked[: max(1, top_n)]
    rng = rng or random.Random()
    recent_cities = {c.strip().upper() for c in (recent_cities or set()) if c}
    recent_ufs = {u.strip().upper() for u in (recent_ufs or set()) if u}
    day = _day_sets(same_day or [])
    weights = []
    for imovel, ranking in pool:
        weight = max(float(getattr(ranking, "total", 0) or 0), 0.01)
        city = str(imovel.get("cidade") or "").strip().upper()
        imovel_uf = str(imovel.get("uf") or "").strip().upper()
        if city and city in recent_cities:
            weight *= city_penalty
        elif imovel_uf and imovel_uf in recent_ufs:
            weight *= uf_penalty
        weight *= _day_factor(imovel, day)
        weights.append(weight)
    chosen = rng.choices(range(len(pool)), weights=weights, k=1)[0]
    return pool[chosen], chosen


def _day_sets(picks: list[dict]) -> dict[str, set[str]]:
    day: dict[str, set[str]] = {"uf": set(), "cidade": set(), "bairro": set(), "tipo": set(), "faixa": set()}
    for pick in picks:
        if str(pick.get("uf_imovel") or "").strip().upper():
            day["uf"].add(str(pick["uf_imovel"]).strip().upper())
        if str(pick.get("cidade") or "").strip().upper():
            day["cidade"].add(str(pick["cidade"]).strip().upper())
        if str(pick.get("bairro") or "").strip().upper():
            day["bairro"].add(str(pick["bairro"]).strip().upper())
        if str(pick.get("tipo") or "").strip().upper():
            day["tipo"].add(str(pick["tipo"]).strip().upper())
        if str(pick.get("faixa") or "").strip():
            day["faixa"].add(str(pick["faixa"]).strip())
    return day


def _day_factor(imovel: dict, day: dict[str, set[str]]) -> float:
    factor = 1.0
    if str(imovel.get("bairro") or "").strip().upper() in day["bairro"]:
        factor *= 0.1
    elif str(imovel.get("cidade") or "").strip().upper() in day["cidade"]:
        factor *= 0.15
    elif str(imovel.get("uf") or "").strip().upper() in day["uf"]:
        factor *= 0.3
    if str(imovel.get("tipoImovel") or "").strip().upper() in day["tipo"]:
        factor *= 0.4
    if price_band(imovel.get("precoVenda")) in day["faixa"]:
        factor *= 0.6
    return factor
