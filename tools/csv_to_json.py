"""
Converte CSVs da Caixa em JSONs estáticos para o frontend.
Gera um arquivo por UF + manifest.json em frontend/public/data/
"""

import csv
import json
import os
import re
import sys

INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "listas")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "data")


def parse_decimal(val: str):
    """Parse valor monetário formato BR: 167.808,34 → 167808.34"""
    if not val or not val.strip():
        return None
    val = val.strip().replace(".", "").replace(",", ".")
    try:
        return float(val)
    except ValueError:
        return None


def parse_area(val: str):
    """Parse área da descrição (ponto é separador decimal): 8640.00 → 8640.0"""
    if not val or not val.strip():
        return None
    val = val.strip().replace(",", ".")
    try:
        return float(val)
    except ValueError:
        return None


def parse_percent(val: str):
    """Parse percentual: 64.97 ou 64,97 → 64.97"""
    if not val or not val.strip():
        return None
    val = val.strip().replace(",", ".")
    try:
        return float(val)
    except ValueError:
        return None


def parse_int(val: str):
    if not val or not val.strip():
        return None
    m = re.search(r"\d+", val.strip())
    return int(m.group()) if m else None


def normalizar_endereco(e: str) -> str:
    """Remove complementos (Apto, BL, LT, QD, PAV, VAGA, etc.) para facilitar geocodificação."""
    e = re.sub(r',\s*(Apto|APT|BL|BLOCO|LT|QD|QUADRA|SL|SALA|COND|TORRE|TR|PAV|PV|VG|VAGA|BOX|CS|CASA|RES|LOT|SETOR|ÁREA|AREA|UND|UNID)\.?\s*[^,]*', '', e, flags=re.I)
    e = re.sub(r',?\s*N\.\s*(00|SN|S/N[º°]?)\b', '', e, flags=re.I)
    e = re.sub(r'\bN\.\s*', '', e)
    e = re.sub(r'\b(LT|QD|LOT|LOTE|QUADRA)\s*[\w\d\-/]+', '', e, flags=re.I)
    e = re.sub(r'\b(PAV|PV|PAVIMENTO|VG|VAGA|BOX|TORRE|BL|BLOCO)\s*[\w\d\-/]*', '', e, flags=re.I)
    e = re.sub(r'\d+º\s*(PAV|ANDAR)?', '', e, flags=re.I)
    e = re.sub(r',\s*,', ',', e)
    e = re.sub(r',\s*$', '', e)
    e = re.sub(r'^\s*,', '', e)
    e = re.sub(r'\s{2,}', ' ', e)
    return e.strip()


def extract_fields(descricao: str):
    """Extrai tipo, áreas, quartos e vagas da descrição."""
    tipo = None
    area_total = None
    area_privativa = None
    area_terreno = None
    quartos = None
    vagas = None

    if descricao:
        # Tipo é a primeira palavra antes da vírgula
        m = re.match(r"^([^,]+)", descricao)
        if m:
            tipo = m.group(1).strip()

        m = re.search(r"([\d.,]+)\s*de\s*[áa]rea\s*total", descricao)
        if m:
            v = parse_area(m.group(1))
            area_total = v if v and v > 0 else None

        m = re.search(r"([\d.,]+)\s*de\s*[áa]rea\s*privativa", descricao)
        if m:
            v = parse_area(m.group(1))
            area_privativa = v if v and v > 0 else None

        m = re.search(r"([\d.,]+)\s*de\s*[áa]rea\s*do\s*terreno", descricao)
        if m:
            v = parse_area(m.group(1))
            area_terreno = v if v and v > 0 else None

        m = re.search(r"(\d+)\s*qto", descricao)
        if m:
            quartos = int(m.group(1))

        m = re.search(r"(\d+)\s*vaga", descricao)
        if m:
            vagas = int(m.group(1))

    return tipo, area_total, area_privativa, area_terreno, quartos, vagas


def parse_csv(filepath: str, uf: str) -> list[dict]:
    imoveis = []
    with open(filepath, "r", encoding="latin-1") as f:
        # Pula linha de título
        lines = f.readlines()

    # Encontra linha de cabeçalho
    header_idx = None
    for i, line in enumerate(lines):
        if "Nº do imóvel" in line or "N\xba do im" in line or "imovel" in line.lower():
            header_idx = i
            break

    if header_idx is None:
        return []

    reader = csv.reader(lines[header_idx:], delimiter=";")
    headers = next(reader)  # cabeçalho
    # Detecta se tem coluna "Financiamento" (12 cols) ou não (11 cols)
    has_financiamento = len(headers) >= 12

    for row in reader:
        if len(row) < 10 or not row[0].strip():
            continue

        numero = row[0].strip()

        if has_financiamento:
            preco = parse_decimal(row[5])
            avaliacao = parse_decimal(row[6])
            desconto_raw = parse_percent(row[7])
            financiamento = row[8].strip() if row[8].strip() else None
            descricao = row[9].strip()
            modalidade = row[10].strip() if len(row) > 10 else ""
            url = row[11].strip() if len(row) > 11 else ""
        else:
            preco = parse_decimal(row[5])
            avaliacao = parse_decimal(row[6])
            desconto_raw = parse_percent(row[7])
            financiamento = None
            descricao = row[8].strip()
            modalidade = row[9].strip() if len(row) > 9 else ""
            url = row[10].strip() if len(row) > 10 else ""

        tipo, area_total, area_priv, area_terreno, quartos, vagas = extract_fields(descricao)

        desconto = desconto_raw
        if desconto is None and preco and avaliacao and avaliacao > 0:
            desconto = round(((avaliacao - preco) / avaliacao) * 100, 2)
        if desconto is not None and (desconto < 0 or desconto > 100):
            desconto = None

        if not url.startswith("http"):
            url = f"https://venda-imoveis.caixa.gov.br/sistema/detalhe-imovel.asp?hdnimovel={numero}"

        imoveis.append({
            "numeroImovel": numero,
            "uf": uf,
            "cidade": row[2].strip(),
            "bairro": row[3].strip(),
            "endereco": normalizar_endereco(row[4].strip()),
            "precoVenda": preco,
            "valorAvaliacao": avaliacao,
            "percentualDesconto": desconto,
            "financiamento": financiamento,
            "descricao": descricao,
            "modalidadeVenda": modalidade,
            "urlOficial": url,
            "tipoImovel": tipo,
            "areaTotal": area_total,
            "areaPrivativa": area_priv,
            "areaTerreno": area_terreno,
            "quartos": quartos,
            "vagas": vagas,
            "lat": None,
            "lng": None,
        })

    return imoveis


def run():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if not os.path.isdir(INPUT_DIR):
        print(f"❌ Diretório de CSVs não encontrado: {INPUT_DIR}")
        sys.exit(1)

    manifest = []
    total_geral = 0

    csvs = sorted([f for f in os.listdir(INPUT_DIR) if f.endswith(".csv")])
    print(f"📊 Convertendo {len(csvs)} CSVs → JSON")
    print("=" * 40)

    for filename in csvs:
        m = re.search(r"Lista_imoveis_(\w{2})\.csv", filename)
        if not m:
            continue

        uf = m.group(1)
        filepath = os.path.join(INPUT_DIR, filename)
        imoveis = parse_csv(filepath, uf)

        out_path = os.path.join(OUTPUT_DIR, f"{uf}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(imoveis, f, ensure_ascii=False)

        manifest.append({"uf": uf, "total": len(imoveis)})
        total_geral += len(imoveis)
        print(f"  {uf}: {len(imoveis)} imóveis")

    # Gera manifest
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False)

    print(f"\n✅ Total: {total_geral} imóveis em {len(manifest)} UFs")
    print(f"📁 Output: {os.path.abspath(OUTPUT_DIR)}/")


if __name__ == "__main__":
    run()
