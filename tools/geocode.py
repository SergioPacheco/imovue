"""
Geocodifica imóveis usando Nominatim (OpenStreetMap) por endereço completo.
Fallback: centroide da cidade via tabela IBGE.
Cache local em tools/.geocode_cache.json para evitar re-requests.

Uso:
  python tools/geocode.py          # todas as UFs
  python tools/geocode.py SP       # apenas SP
  python tools/geocode.py SP --force  # ignora cache
"""

import json
import os
import sys
import time
import unicodedata
import requests

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "data")
CACHE_FILE = os.path.join(os.path.dirname(__file__), ".geocode_cache.json")
MUNICIPIOS_URL = "https://raw.githubusercontent.com/kelvins/Municipios-Brasileiros/main/csv/municipios.csv"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "Imovue/1.0 (https://imovue.com.br)"

UF_CODES = {
    '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
    '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL',
    '28': 'SE', '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP', '41': 'PR',
    '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF',
}


def normalizar(texto: str) -> str:
    nfkd = unicodedata.normalize('NFKD', texto)
    return ''.join(c for c in nfkd if not unicodedata.combining(c)).upper().strip()


def load_city_lookup() -> dict:
    """Tabela IBGE: cidade|UF → (lat, lng) como fallback."""
    r = requests.get(MUNICIPIOS_URL, timeout=30)
    lines = r.text.strip().split('\n')[1:]
    lookup = {}
    for line in lines:
        parts = line.split(',')
        if len(parts) < 6:
            continue
        nome = normalizar(parts[1])
        lat, lng = float(parts[2]), float(parts[3])
        uf = UF_CODES.get(parts[5], '')
        if uf:
            lookup[f'{nome}|{uf}'] = (lat, lng)
    return lookup


def load_cache() -> dict:
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE) as f:
            return json.load(f)
    return {}


def save_cache(cache: dict):
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False)


def geocode_nominatim(endereco: str, bairro: str, cidade: str, uf: str) -> tuple[float, float] | None:
    """Consulta Nominatim com cascata: endereço+bairro → bairro+cidade. Retorna (lat, lng) ou None."""
    queries = []
    if endereco:
        queries.append(f"{endereco}, {bairro}, {cidade}, {uf}, Brasil")
    if bairro:
        queries.append(f"{bairro}, {cidade}, {uf}, Brasil")

    for query in queries:
        try:
            r = requests.get(NOMINATIM_URL, params={
                'q': query, 'format': 'json', 'limit': 1, 'countrycodes': 'br'
            }, headers={'User-Agent': USER_AGENT}, timeout=10)
            if r.status_code == 200 and r.json():
                result = r.json()[0]
                lat, lon = float(result['lat']), float(result['lon'])
                # Verificar se não é centroide do estado/país (muito genérico)
                if result.get('class') not in ('boundary',) or result.get('type') not in ('administrative',):
                    return lat, lon
        except Exception:
            pass
        time.sleep(1.1)

    return None


def run():
    uf_filter = None
    force = '--force' in sys.argv
    for arg in sys.argv[1:]:
        if arg != '--force' and len(arg) == 2:
            uf_filter = arg.upper()

    print("🗺️  Geocodificando imóveis (Nominatim + fallback IBGE)...")
    city_lookup = load_city_lookup()
    print(f"   {len(city_lookup)} cidades no fallback IBGE")

    cache = {} if force else load_cache()
    print(f"   {len(cache)} endereços em cache")

    manifest_path = os.path.join(DATA_DIR, "manifest.json")
    with open(manifest_path) as f:
        manifest = json.load(f)

    ufs = [e["uf"] for e in manifest]
    if uf_filter:
        ufs = [u for u in ufs if u == uf_filter]

    stats = {'nominatim': 0, 'cache_hit': 0, 'fallback_city': 0, 'failed': 0, 'total': 0}
    requests_made = 0

    for uf in ufs:
        path = os.path.join(DATA_DIR, f"{uf}.json")
        with open(path) as f:
            data = json.load(f)

        for im in data:
            stats['total'] += 1
            endereco = im.get('endereco', '')
            cidade = im.get('cidade', '')
            cache_key = f"{endereco}|{cidade}|{uf}"

            # 1. Tenta cache
            if cache_key in cache:
                coords = cache[cache_key]
                if coords:
                    im['lat'], im['lng'] = coords
                    stats['cache_hit'] += 1
                else:
                    # Cache negativo: usar fallback cidade
                    city_key = f"{normalizar(cidade)}|{uf}"
                    if city_key in city_lookup:
                        im['lat'], im['lng'] = city_lookup[city_key]
                        stats['fallback_city'] += 1
                    else:
                        im['lat'] = im['lng'] = None
                        stats['failed'] += 1
                continue

            # 2. Consulta Nominatim (com throttle)
            bairro_im = im.get('bairro', '')
            if endereco or bairro_im:
                time.sleep(1.1)  # Nominatim policy: max 1 req/s
                coords = geocode_nominatim(endereco, bairro_im, cidade, uf)
                requests_made += 1

                if coords:
                    im['lat'], im['lng'] = coords
                    cache[cache_key] = coords
                    stats['nominatim'] += 1
                else:
                    # Fallback: centroide da cidade
                    cache[cache_key] = None  # cache negativo
                    city_key = f"{normalizar(cidade)}|{uf}"
                    if city_key in city_lookup:
                        im['lat'], im['lng'] = city_lookup[city_key]
                        stats['fallback_city'] += 1
                    else:
                        im['lat'] = im['lng'] = None
                        stats['failed'] += 1
            else:
                city_key = f"{normalizar(cidade)}|{uf}"
                if city_key in city_lookup:
                    im['lat'], im['lng'] = city_lookup[city_key]
                    stats['fallback_city'] += 1
                else:
                    im['lat'] = im['lng'] = None
                    stats['failed'] += 1

            # Salvar cache a cada 50 requests
            if requests_made > 0 and requests_made % 50 == 0:
                save_cache(cache)
                print(f"   ... {requests_made} requests, {stats['nominatim']} resolvidos por endereço")

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)

        nominatim_uf = sum(1 for i in data if i.get('lat'))
        print(f"   {uf}: {nominatim_uf}/{len(data)} geocodificados")

    save_cache(cache)

    print(f"\n✅ Resultado:")
    print(f"   Nominatim (endereço): {stats['nominatim']}")
    print(f"   Cache hit:            {stats['cache_hit']}")
    print(f"   Fallback (cidade):    {stats['fallback_city']}")
    print(f"   Sem coordenada:       {stats['failed']}")
    print(f"   Total:                {stats['total']}")
    print(f"   Requests feitos:      {requests_made}")


if __name__ == "__main__":
    run()
