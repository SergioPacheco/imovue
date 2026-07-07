"""
Geocodifica imóveis usando Nominatim (OpenStreetMap) por BAIRRO (não endereço individual).
Fallback: centroide da cidade via tabela IBGE.
Cache local em tools/.geocode_cache.json para evitar re-requests.

OTIMIZAÇÃO: Geocodifica por bairro+cidade (1 request por bairro) em vez de por endereço
individual (1 request por imóvel). Reduz ~28k requests para ~3k.

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

# Nominatim rate limit: max 1 req/s
NOMINATIM_DELAY = 1.1

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


def geocode_bairro(bairro: str, cidade: str, uf: str) -> tuple[float, float] | None:
    """Consulta Nominatim por bairro+cidade. Retorna (lat, lng) ou None."""
    query = f"{bairro}, {cidade}, {uf}, Brasil"
    try:
        r = requests.get(NOMINATIM_URL, params={
            'q': query, 'format': 'json', 'limit': 1, 'countrycodes': 'br'
        }, headers={'User-Agent': USER_AGENT}, timeout=10)
        if r.status_code == 200 and r.json():
            result = r.json()[0]
            return float(result['lat']), float(result['lon'])
    except Exception:
        pass
    return None


def run():
    uf_filter = None
    force = '--force' in sys.argv
    for arg in sys.argv[1:]:
        if arg != '--force' and len(arg) == 2:
            uf_filter = arg.upper()

    print("🗺️  Geocodificando imóveis (por BAIRRO — otimizado)")
    city_lookup = load_city_lookup()
    print(f"   {len(city_lookup)} cidades no fallback IBGE")

    cache = {} if force else load_cache()
    print(f"   {len(cache)} bairros em cache")

    manifest_path = os.path.join(DATA_DIR, "manifest.json")
    with open(manifest_path) as f:
        manifest = json.load(f)

    ufs = [e["uf"] for e in manifest]
    if uf_filter:
        ufs = [u for u in ufs if u == uf_filter]

    stats = {'nominatim': 0, 'cache_hit': 0, 'fallback_city': 0, 'already_geocoded': 0, 'failed': 0, 'total': 0}
    requests_made = 0

    for uf in ufs:
        path = os.path.join(DATA_DIR, f"{uf}.json")
        with open(path) as f:
            data = json.load(f)

        # Agrupar imóveis por bairro+cidade (1 lookup por grupo)
        bairro_groups: dict[str, list] = {}
        for im in data:
            stats['total'] += 1

            # Skip se já tem coordenada válida
            if im.get('lat') and im.get('lng'):
                stats['already_geocoded'] += 1
                continue

            bairro = im.get('bairro', '') or ''
            cidade = im.get('cidade', '') or ''
            key = f"{bairro}|{cidade}|{uf}"

            if key not in bairro_groups:
                bairro_groups[key] = []
            bairro_groups[key].append(im)

        # Geocodificar por bairro (não por endereço individual)
        for key, imoveis in bairro_groups.items():
            bairro, cidade, uf_code = key.split('|', 2)
            cache_key = key  # cache por bairro+cidade+uf

            coords = None

            # 1. Cache
            if cache_key in cache:
                coords = cache[cache_key]
                stats['cache_hit'] += len(imoveis)
            else:
                # 2. Nominatim (por bairro)
                if bairro:
                    coords = geocode_bairro(bairro, cidade, uf_code)
                    requests_made += 1
                    time.sleep(NOMINATIM_DELAY)

                    if requests_made % 50 == 0:
                        save_cache(cache)
                        print(f"   ... {requests_made} requests feitos")

                # Cachear resultado (positivo ou negativo)
                cache[cache_key] = coords if coords else None

                if coords:
                    stats['nominatim'] += len(imoveis)
                else:
                    # 3. Fallback: centroide cidade (IBGE)
                    city_key = f"{normalizar(cidade)}|{uf_code}"
                    if city_key in city_lookup:
                        coords = city_lookup[city_key]
                        stats['fallback_city'] += len(imoveis)
                    else:
                        stats['failed'] += len(imoveis)

            # Aplicar coordenadas a todos os imóveis do grupo
            if coords:
                for im in imoveis:
                    im['lat'], im['lng'] = coords
            else:
                for im in imoveis:
                    im['lat'] = im['lng'] = None

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)

        geocoded = sum(1 for i in data if i.get('lat'))
        print(f"   {uf}: {geocoded}/{len(data)} geocodificados ({len(bairro_groups)} bairros processados)")

    save_cache(cache)

    print(f"\n✅ Resultado:")
    print(f"   Já geocodificados:    {stats['already_geocoded']}")
    print(f"   Nominatim (bairro):   {stats['nominatim']}")
    print(f"   Cache hit:            {stats['cache_hit']}")
    print(f"   Fallback (cidade):    {stats['fallback_city']}")
    print(f"   Sem coordenada:       {stats['failed']}")
    print(f"   Total:                {stats['total']}")
    print(f"   Requests Nominatim:   {requests_made}")


if __name__ == "__main__":
    run()
