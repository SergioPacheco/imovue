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
DEFAULT_RECENT_DAYS = 60
DEFAULT_MAX_DATA_AGE_HOURS = 72
DEFAULT_GRAPH_VERSION = "v23.0"

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


def load_pages() -> dict[str, dict]:
    if not PAGES_FILE.exists():
        return {}
    with PAGES_FILE.open(encoding="utf-8") as file:
        return json.load(file)


def load_page_tokens() -> dict[str, str]:
    # Prefere um secret separado por página; o JSON permanece compatível para
    # facilitar a expansão para as futuras páginas estaduais.
    individual = {
        key.removeprefix("META_PAGE_TOKEN_").upper(): value
        for key, value in os.environ.items()
        if key.startswith("META_PAGE_TOKEN_") and value.strip()
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
    return os.environ.get("META_GRAPH_VERSION", DEFAULT_GRAPH_VERSION).strip() or DEFAULT_GRAPH_VERSION
