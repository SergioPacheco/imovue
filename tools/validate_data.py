"""
Valida JSONs gerados antes de commitar.
Falha se algum JSON está vazio, corrompido ou perdeu >50% dos imóveis.
"""

import json
import os
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "data")
MIN_IMOVEIS_POR_UF = 1


def run():
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
    for entry in manifest:
        uf = entry["uf"]
        json_path = os.path.join(DATA_DIR, f"{uf}.json")

        if not os.path.exists(json_path):
            erros.append(f"{uf}: arquivo não encontrado")
            continue

        try:
            with open(json_path) as f:
                data = json.load(f)
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            erros.append(f"{uf}: JSON corrompido — {e}")
            continue

        if not isinstance(data, list):
            erros.append(f"{uf}: JSON não é uma lista")
            continue

        if len(data) < MIN_IMOVEIS_POR_UF:
            erros.append(f"{uf}: apenas {len(data)} imóveis (mínimo: {MIN_IMOVEIS_POR_UF})")
            continue

        # Verifica estrutura mínima do primeiro imóvel
        sample = data[0]
        campos_obrigatorios = ["numeroImovel", "uf", "cidade", "precoVenda"]
        faltando = [c for c in campos_obrigatorios if c not in sample]
        if faltando:
            erros.append(f"{uf}: campos ausentes no JSON — {faltando}")

    if erros:
        print("❌ Validação FALHOU — commit abortado:")
        for e in erros:
            print(f"   • {e}")
        sys.exit(1)

    total = sum(entry["total"] for entry in manifest)
    print(f"✅ Validação OK — {len(manifest)} UFs, {total} imóveis")


if __name__ == "__main__":
    run()
