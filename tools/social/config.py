from __future__ import annotations

import json
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "frontend" / "public" / "data"
SOCIAL_CONFIG_DIR = ROOT_DIR / "social"
PAGES_FILE = SOCIAL_CONFIG_DIR / "facebook_pages.json"
STATE_FILE = SOCIAL_CONFIG_DIR / "published.json"
OUTPUT_DIR = ROOT_DIR / "out" / "social"

SITE_URL = "https://imovue.com.br"
DEFAULT_MIN_DISCOUNT = 25.0
DEFAULT_RECENT_DAYS = 30
DEFAULT_MAX_DATA_AGE_HOURS = 72  # Obsoleto: mantido por compatibilidade, sem efeito.
DEFAULT_GRAPH_VERSION = "v23.0"

# Estratégia de publicação da página nacional (horários locais do Brasil).
# Centraliza aqui: nenhuma lógica de horário deve ficar espalhada no código.
DEFAULT_TIMEZONE = "America/Sao_Paulo"
DEFAULT_POSTS_PER_DAY = 3
ALLOWED_POSTS_PER_DAY = (2, 3, 4)
# Slots por quantidade diária (horário local America/Sao_Paulo).
SCHEDULES = {
    2: ("11:30", "19:00"),
    3: ("10:00", "14:30", "19:30"),
    4: ("09:30", "12:30", "16:30", "20:00"),
}
# Janela após o disparo do cron em que o slot ainda vale (atraso do runner).
SLOT_TOLERANCE_MINUTES = 50
# Teto do histórico (cobre 27 páginas × 3 posts/dia por mais de 100 dias,
# bem acima da janela anti-duplicidade de 30 dias).
PUBLISHED_HISTORY_LIMIT = 10000

UF_NAMES = {
    "BR": "Brasil",
    "AC": "Acre", "AL": "Alagoas", "AP": "Amapá", "AM": "Amazonas",
    "BA": "Bahia", "CE": "Ceará", "DF": "Distrito Federal", "ES": "Espírito Santo",
    "GO": "Goiás", "MA": "Maranhão", "MT": "Mato Grosso", "MS": "Mato Grosso do Sul",
    "MG": "Minas Gerais", "PA": "Pará", "PB": "Paraíba", "PR": "Paraná",
    "PE": "Pernambuco", "PI": "Piauí", "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte",
    "RS": "Rio Grande do Sul", "RO": "Rondônia", "RR": "Roraima", "SC": "Santa Catarina",
    "SP": "São Paulo", "SE": "Sergipe", "TO": "Tocantins",
}


def load_local_env() -> None:
    """Carrega um .env simples sem substituir variáveis já exportadas."""
    env_path = ROOT_DIR / ".env"
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        if key and key not in os.environ:
            os.environ[key] = value


def load_pages() -> dict[str, dict]:
    if not PAGES_FILE.exists():
        return {}
    with PAGES_FILE.open(encoding="utf-8") as file:
        return json.load(file)


def load_page_tokens() -> dict[str, str]:
    # REGRA DE OURO: existe APENAS 1 secret — FB_SYSTEM_USER_TOKEN (System User
    # imovue-cron, sem expiração). Nenhum outro token é lido, criado ou salvo.
    load_local_env()
    system_token = os.environ.get("FB_SYSTEM_USER_TOKEN", "").strip()
    if not system_token:
        return {}
    return dict.fromkeys(UF_NAMES, system_token)


def graph_version() -> str:
    load_local_env()
    return os.environ.get("META_GRAPH_VERSION", DEFAULT_GRAPH_VERSION).strip() or DEFAULT_GRAPH_VERSION


def resolve_page_tokens(pages: dict[str, dict]) -> dict[str, str]:
    """Resolve o token efetivo por UF.

    Na nova experiência de Páginas, os endpoints de leitura/publicação exigem
    o Page Access Token de cada página — o token do System User sozinho é
    rejeitado (#10). A troca é feita em tempo de execução via
    ``GET /me/accounts`` e os page tokens vivem só em memória: nenhum token
    é gravado em disco, log ou repositório.

    Sem system token (ou se a troca voltar vazia), cai para
    :func:`load_page_tokens` sem erro — a UF é ignorada na publicação.
    """
    load_local_env()
    base = load_page_tokens()
    system_token = os.environ.get("FB_SYSTEM_USER_TOKEN", "").strip()
    if not system_token:
        return base
    try:
        page_tokens, page_names = _exchange_system_token(system_token)
    except Exception as exc:
        # Exceções do requests podem embutir a URL (com access_token).
        print(f"⚠️ Falha na troca por page tokens ({_sanitize(str(exc))}); usando token configurado.")
        return base
    if not page_tokens:
        print("⚠️ System User sem ativos (me/accounts voltou 0 páginas); usando token configurado.")
        return base
    _report_discovery(pages or {}, page_names)
    resolved = dict(base)
    for uf, page in (pages or {}).items():
        page_id = str((page or {}).get("pageId") or "").strip()
        if page_id and page_id in page_tokens:
            resolved[str(uf).upper()] = page_tokens[page_id]
    return resolved


def _report_discovery(pages: dict[str, dict], page_names: dict[str, str]) -> None:
    """Auto-discovery assistido: reporta divergências, nunca posta sozinho.

    - Página acessível ao System User mas fora do facebook_pages.json é só
      REPORTADA (ex.: página nova ou de outro projeto) — jamais publicada
      sem cadastro explícito com enabled + pageId.
    - UF configurada mas sem acesso indica ativo faltando no System User.
    """
    configured = {
        str((page or {}).get("pageId") or "").strip(): uf
        for uf, page in pages.items()
    }
    configured.pop("", None)
    for page_id, name in sorted(page_names.items(), key=lambda item: item[1]):
        if page_id not in configured:
            print(f"ℹ️ Página acessível fora do cadastro (ignorada): {name} ({page_id})")
    for page_id, uf in sorted(configured.items()):
        if page_id not in page_names:
            print(f"⚠️ {uf} configurada mas sem acesso via System User — verifique os ativos ({page_id})")


def _exchange_system_token(system_token: str) -> tuple[dict[str, str], dict[str, str]]:
    """Troca system token por page tokens.

    Retorna (page_tokens, page_names): page_id → page_token e page_id → nome.
    Nomes servem só para o relatório de discovery — tokens nunca vão a log.
    """
    import requests

    url = f"https://graph.facebook.com/{graph_version()}/me/accounts"
    page_tokens: dict[str, str] = {}
    page_names: dict[str, str] = {}
    params: dict[str, object] = {"fields": "id,name,access_token", "limit": 100}
    while url:
        # O token vai como parâmetro, mas nunca entra em logs ou exceções:
        # em caso de erro, só a mensagem da Meta (sem o token) é propagada.
        response = requests.get(url, params={**params, "access_token": system_token}, timeout=30)
        if response.status_code >= 400:
            raise RuntimeError(_graph_error_message(response))
        data = response.json()
        for item in data.get("data", []):
            page_id = str(item.get("id") or "").strip()
            page_token = str(item.get("access_token") or "").strip()
            if page_id:
                page_names[page_id] = str(item.get("name") or page_id)
            if page_id and page_token:
                page_tokens[page_id] = page_token
        paging = (data.get("paging") or {}).get("next", "")
        url = paging
        params = {}
    return page_tokens, page_names


def _graph_error_message(response) -> str:
    try:
        error = response.json().get("error", {})
        detail = error.get("message") or ""
        code = error.get("code", "")
        return f"Graph API {response.status_code}/{code}: {detail}"[:300]
    except ValueError:
        return f"Graph API {response.status_code}"


def _sanitize(text: str) -> str:
    """Remove valores de access_token de mensagens de erro (nunca em log)."""
    import re

    text = re.sub(r"access_token=[^&\s]+", "access_token=***", text)
    if len(text) > 300:
        text = text[:300]
    return text


def facebook_timezone() -> str:
    load_local_env()
    return os.environ.get("IMOVUE_FACEBOOK_TIMEZONE", DEFAULT_TIMEZONE).strip() or DEFAULT_TIMEZONE


def posts_per_day() -> int:
    """Quantidade diária (2-4); ausente ou inválido cai para 3."""
    load_local_env()
    try:
        value = int(os.environ.get("IMOVUE_FACEBOOK_POSTS_PER_DAY", DEFAULT_POSTS_PER_DAY))
    except (TypeError, ValueError):
        return DEFAULT_POSTS_PER_DAY
    return value if value in ALLOWED_POSTS_PER_DAY else DEFAULT_POSTS_PER_DAY


def repost_after_days() -> int:
    load_local_env()
    try:
        value = int(os.environ.get("IMOVUE_FACEBOOK_REPOST_AFTER_DAYS", DEFAULT_RECENT_DAYS))
    except (TypeError, ValueError):
        return DEFAULT_RECENT_DAYS
    return value if value > 0 else DEFAULT_RECENT_DAYS


def schedule_for(count: int) -> tuple[str, ...]:
    return SCHEDULES.get(count, SCHEDULES[DEFAULT_POSTS_PER_DAY])
