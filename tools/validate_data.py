"""
Valida JSONs gerados antes de commitar.
Falha se algum JSON está corrompido ou se o dataset inteiro está vazio.
Uma UF pode estar sem oferta na lista atual.

Uso:
  python tools/validate_data.py      # todas as UFs
  python tools/validate_data.py SP   # apenas SP
"""

import json
import os
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "data")
MIN_IMOVEIS_POR_UF = 0


def validate_uf(uf: str, erros: list) -> int:
    json_path = os.path.join(DATA_DIR, f"{uf}.json")

    if not os.path.exists(json_path):
        erros.append(f"{uf}: arquivo não encontrado")
        return 0

    try:
        with open(json_path) as f:
            data = json.load(f)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        erros.append(f"{uf}: JSON corrompido — {e}")
        return 0

    if not isinstance(data, list):
        erros.append(f"{uf}: JSON não é uma lista")
        return 0

    if len(data) == 0:
        print(f"⚠️ {uf}: nenhum imóvel disponível na lista atual")
        return 0

    # Verifica estrutura mínima do primeiro imóvel
    sample = data[0]
    campos_obrigatorios = ["numeroImovel", "uf", "cidade", "precoVenda"]
    faltando = [c for c in campos_obrigatorios if c not in sample]
    if faltando:
        erros.append(f"{uf}: campos ausentes no JSON — {faltando}")

    return len(data)


def run():
    uf_filter = None
    for arg in sys.argv[1:]:
        if len(arg) == 2:
            uf_filter = arg.upper()

    manifest_path = os.path.join(DATA_DIR, "manifest.json")
    if not os.path.exists(manifest_path):
        print("❌ manifest.json não encontrado")
        sys.exit(1)

    with open(manifest_path) as f:
        manifest = json.load(f)

    if not manifest:
        print("❌ manifest.json está vazio")
        sys.exit(1)

    erros = []
    total = 0
    ufs = [e["uf"] for e in manifest]
    if uf_filter:
        if uf_filter not in ufs:
            print(f"❌ UF {uf_filter} não consta no manifest")
            sys.exit(1)
        ufs = [uf_filter]

    for uf in ufs:
        total += validate_uf(uf, erros)

    if not uf_filter and total == 0:
        erros.append("dataset inteiro está vazio")

    if erros:
        print("❌ Validação FALHOU — commit abortado:")
        for e in erros:
            print(f"   • {e}")
        sys.exit(1)

    scope = uf_filter or f"{len(manifest)} UFs"
    print(f"✅ Validação OK — {scope}, {total} imóveis")


if __name__ == "__main__":
    run()
