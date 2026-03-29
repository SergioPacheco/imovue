from playwright.sync_api import sync_playwright
import os
import time

UFS = ["SP", "MG", "BA", "PR", "RS", "PE", "CE", "PA", "MA", "GO", "SC", "PB", "ES", "AM", "RN", "AL", "MT", "DF", "MS", "SE", "RO", "TO", "AC", "AP", "RR", "PI"]
BASE_URL = "https://venda-imoveis.caixa.gov.br/listaweb/Lista_imoveis_{}.csv"
OUTPUT_DIR = "data/listas"

os.makedirs(OUTPUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=['--disable-blink-features=AutomationControlled']
    )
    context = browser.new_context(
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
    
    for uf in UFS:
        url = BASE_URL.format(uf)
        dest = f"{OUTPUT_DIR}/Lista_imoveis_{uf}.csv"
        try:
            with context.expect_download(timeout=15000) as download_info:
                page = context.new_page()
                page.goto(url, timeout=15000)
            download = download_info.value
            download.save_as(dest)
            print(f"[OK] {uf}")
            page.close()
        except Exception as e:
            print(f"[SKIP] {uf}")
        time.sleep(1)
    
    browser.close()
