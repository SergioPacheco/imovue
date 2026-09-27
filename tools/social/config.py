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
    load_local_env()
    # Prefere um secret separado por página; o JSON permanece compatível para
    # facilitar a expansão para as futuras páginas estaduais.
    individual = {
        key.removeprefix("META_PAGE_TOKEN_").upper(): value
        for key, value in os.environ.items()
        if key.startswith("META_PAGE_TOKEN_") and key != "META_PAGE_TOKENS_JSON" and value.strip()
    }
    raw = os.environ.get("META_PAGE_TOKENS_JSON", "{}").strip()
    if not raw:
        return individual
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("META_PAGE_TOKENS_JSON não contém JSON válido") from exc
    if not isinstance(parsed, dict):
        raise ValueError("META_PAGE_TOKENS_JSON deve ser um objeto UF → token")
    tokens = {str(uf).upper(): str(token) for uf, token in parsed.items() if token}
    tokens.update(individual)
    return tokens


def graph_version() -> str:
    load_local_env()
    return os.environ.get("META_GRAPH_VERSION", DEFAULT_GRAPH_VERSION).strip() or DEFAULT_GRAPH_VERSION


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
