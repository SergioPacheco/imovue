from __future__ import annotations

from datetime import timedelta

from .config import DATA_DIR, DEFAULT_MIN_DISCOUNT, DEFAULT_RECENT_DAYS, STATE_FILE
from .ranking import rank_property
from .utils import now_utc, parse_datetime, read_json


def load_properties(uf: str) -> list[dict]:
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
        if discount < minimum_discount or property_id in recent_ids:
            continue
        result.append((imovel, rank_property(imovel, median_for(imovel, stats))))
    return sorted(result, key=lambda item: (item[1].total, float(item[0].get("percentualDesconto") or 0)), reverse=True)

