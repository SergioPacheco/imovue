from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode

from .config import SITE_URL


def clean_text(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def display_name(value: object) -> str:
    text = clean_text(value)
    if not text:
        return ""
    lowercase = {"a", "as", "ao", "aos", "da", "das", "de", "do", "dos", "e", "em", "na", "nas", "no", "nos"}
    words = []
    for index, word in enumerate(text.lower().split(" ")):
        words.append(word if index > 0 and word in lowercase else word[:1].upper() + word[1:])
    return " ".join(words)


def currency(value: object) -> str:
    if value is None or value == "":
        return "Não informado"
    number = float(value)
    formatted = f"{number:,.0f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {formatted}"


def percent(value: object) -> str:
    if value is None or value == "":
        return "Não informado"
    number = float(value)
    formatted = f"{number:.1f}".replace(".", ",")
    return f"{formatted}%"


def number(value: object) -> str:
    if value is None or value == "":
        return ""
    return f"{float(value):,.0f}".replace(",", ".")


def area(value: object) -> str:
    if value is None or float(value) <= 0:
        return ""
    return f"{float(value):,.0f}".replace(",", ".") + " m²"


def property_url(imovel: dict, uf: str) -> str:
    property_id = clean_text(imovel.get("numeroImovel"))
    query = urlencode({
        "utm_source": "facebook",
        "utm_medium": "social",
        "utm_campaign": f"{uf.lower()}_daily",
        "utm_content": property_id,
    })
    return f"{SITE_URL}/imovel/{property_id}?{query}"


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def parse_datetime(value: object) -> datetime | None:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def read_json(path: Path, fallback):
    if not path.exists():
        return fallback
    with path.open(encoding="utf-8") as file:
        return json.load(file)


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8") as file:
        json.dump(value, file, ensure_ascii=False, indent=2)
        file.write("\n")
    temporary.replace(path)

