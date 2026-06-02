"""
Geocodifica imóveis usando Nominatim (OpenStreetMap) com cache incremental.
Adiciona lat/lng aos JSONs em frontend/public/data/.
Respeita rate limit de 1 req/s.
"""

import json
import os
import sys
import time
import requests

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "data")
CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "geocode_cache.json")
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "Imovue/1.0 (https://imovue.com.br)"}


def load_cache() -> dict:
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE) as f:
            return json.load(f)
    return {}


def save_cache(cache: dict):
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, ensure_ascii=False)


def geocode(bairro: str, cidade: str, uf: str) -> tuple[float, float] | None:
    """Tenta bairro+cidade+UF, fallback para cidade+UF."""
    queries = [
        f"{bairro}, {cidade}, {uf}, Brasil",
        f"{cidade}, {uf}, Brasil",
    ]
    for q in queries:
        try:
            r = requests.get(NOMINATIM_URL, params={
                "q": q, "format": "json", "limit": 1, "countrycodes": "br"
            }, headers=HEADERS, timeout=10)
            results = r.json()
            if results:
                return float(results[0]["lat"]), float(results[0]["lon"])
        except Exception:
            pass
        time.sleep(1.1)
    return None


def run():
    # Filtro opcional por UF
    uf_filter = sys.argv[1].upper() if len(sys.argv) > 1 else None

    manifest_path = os.path.join(DATA_DIR, "manifest.json")
    with open(manifest_path) as f:
        manifest = json.load(f)

    cache = load_cache()
    total_geo = 0
    total_cached = 0
    total_fail = 0

    ufs = [e["uf"] for e in manifest]
    if uf_filter:
        ufs = [u for u in ufs if u == uf_filter]

    print(f"🗺️  Geocodificando {len(ufs)} UF(s)...")
    print("=" * 40)

    for uf in ufs:
        json_path = os.path.join(DATA_DIR, f"{uf}.json")
        with open(json_path) as f:
            imoveis = json.load(f)

        modified = False
        for im in imoveis:
            # Cache key = bairro|cidade|uf
            key = f"{im['bairro']}|{im['cidade']}|{im['uf']}"

            if key in cache:
                im["lat"] = cache[key][0]
                im["lng"] = cache[key][1]
                total_cached += 1
                modified = True
                continue

            if im.get("lat") is not None:
                total_cached += 1
                continue

            coords = geocode(im["bairro"], im["cidade"], im["uf"])
            if coords:
                im["lat"] = round(coords[0], 6)
                im["lng"] = round(coords[1], 6)
                cache[key] = [im["lat"], im["lng"]]
                total_geo += 1
                modified = True
            else:
                im["lat"] = None
                im["lng"] = None
                total_fail += 1

            # Salvar cache periodicamente
            if total_geo % 50 == 0 and total_geo > 0:
                save_cache(cache)

        if modified:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(imoveis, f, ensure_ascii=False)

        geo_uf = sum(1 for i in imoveis if i.get("lat"))
        print(f"  {uf}: {geo_uf}/{len(imoveis)} geocodificados")

    save_cache(cache)
    print(f"\n✅ Geocodificação concluída")
    print(f"   Novos: {total_geo} | Cache: {total_cached} | Falhas: {total_fail}")


if __name__ == "__main__":
    run()
