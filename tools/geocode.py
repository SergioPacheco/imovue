"""
Geocodifica imóveis usando tabela de municípios brasileiros (IBGE).
Instantâneo, sem rate limit, sem API key. Precisão: nível cidade.
Roda após csv_to_json.py.
"""

import json
import os
import sys
import requests

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "data")
MUNICIPIOS_URL = "https://raw.githubusercontent.com/kelvins/Municipios-Brasileiros/main/csv/municipios.csv"

UF_CODES = {
    '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
    '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL',
    '28': 'SE', '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP', '41': 'PR',
    '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF',
}


def normalizar(texto: str) -> str:
    """Remove acentos e uppercase."""
    import unicodedata
    nfkd = unicodedata.normalize('NFKD', texto)
    return ''.join(c for c in nfkd if not unicodedata.combining(c)).upper()


def load_lookup() -> dict:
    """Baixa tabela de municípios e retorna lookup nome|uf -> (lat, lng)."""
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


def run():
    uf_filter = sys.argv[1].upper() if len(sys.argv) > 1 else None

    print("🗺️  Geocodificando imóveis (tabela IBGE)...")
    lookup = load_lookup()
    print(f"   {len(lookup)} cidades no lookup")

    manifest_path = os.path.join(DATA_DIR, "manifest.json")
    with open(manifest_path) as f:
        manifest = json.load(f)

    ufs = [e["uf"] for e in manifest]
    if uf_filter:
        ufs = [u for u in ufs if u == uf_filter]

    total_matched = 0
    total_all = 0

    for uf in ufs:
        path = os.path.join(DATA_DIR, f"{uf}.json")
        with open(path) as f:
            data = json.load(f)

        matched = 0
        for im in data:
            key = f"{normalizar(im['cidade'])}|{im['uf']}"
            if key in lookup:
                im['lat'] = lookup[key][0]
                im['lng'] = lookup[key][1]
                matched += 1
            else:
                im['lat'] = None
                im['lng'] = None

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)

        total_matched += matched
        total_all += len(data)

    pct = (total_matched * 100 // total_all) if total_all else 0
    print(f"✅ {total_matched}/{total_all} geocodificados ({pct}%)")


if __name__ == "__main__":
    run()
