"""
Download dos CSVs de imóveis da Caixa para todos os estados do Brasil.
Usa Playwright para contornar a proteção anti-bot (Radware CAPTCHA).
"""

from playwright.sync_api import sync_playwright
import os
import time

UFS = [
    "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
    "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
    "RO", "RR", "RS", "SC", "SE", "SP", "TO",
]

BASE_URL = "https://venda-imoveis.caixa.gov.br/listaweb/Lista_imoveis_{}.csv"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "listas")


def run():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("📥 Download CSVs de imóveis da Caixa — Todos os estados")
    print("=" * 55)

    ok = []
    falhas = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled"],
        )
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/120.0.0.0 Safari/537.36",
            accept_downloads=True,
        )

        for uf in UFS:
            url = BASE_URL.format(uf)
            dest = os.path.join(OUTPUT_DIR, f"Lista_imoveis_{uf}.csv")
            page = context.new_page()

            try:
                with page.expect_download(timeout=30000) as download_info:
                    try:
                        page.goto(url, timeout=30000)
                    except Exception:
                        pass  # "Download is starting" é esperado

                download = download_info.value
                download.save_as(dest)

                size_kb = os.path.getsize(dest) / 1024
                print(f"  [OK] {uf} ({size_kb:.1f} KB)")
                ok.append(uf)

            except Exception as e:
                print(f"  [SKIP] {uf} — {str(e)[:80]}")
                falhas.append(uf)
            finally:
                page.close()

            time.sleep(1)

        browser.close()

    print(f"\n✅ Concluído: {len(ok)}/{len(UFS)} estados baixados")
    print(f"📁 Arquivos em: {os.path.abspath(OUTPUT_DIR)}/")

    if falhas:
        print(f"⚠️  Não baixados: {', '.join(falhas)}")


if __name__ == "__main__":
    run()
