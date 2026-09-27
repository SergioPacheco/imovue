"""Remove do Facebook os posts cujos imóveis saíram do catálogo.

Cruza `social/published.json` com os JSONs atuais em `frontend/public/data/`:
todo registro com `property_id` ausente do catálogo (e ainda não marcado
como `removed`) tem seu `post_id` deletado via Graph API.

Uso manual (prever antes de aplicar):

    python tools/social/prune_stale.py --dry-run
    python tools/social/prune_stale.py

No workflow diário a limpeza roda automaticamente antes da publicação.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from social.config import DATA_DIR, STATE_FILE, load_page_tokens
    from social.facebook_client import FacebookAPIError, FacebookClient
    from social.utils import now_utc, read_json, write_json
else:
    from .config import DATA_DIR, STATE_FILE, load_page_tokens
    from .facebook_client import FacebookAPIError, FacebookClient
    from .utils import now_utc, read_json, write_json


def parser() -> argparse.ArgumentParser:
    command = argparse.ArgumentParser(description="Deleta posts de imóveis que saíram do catálogo.")
    command.add_argument("--dry-run", action="store_true", help="Apenas lista o que seria removido.")
    command.add_argument("--uf", action="append", metavar="UF", default=None,
                         help="Limita a limpeza a um escopo (ex: BR); pode ser repetido.")
    return command


def load_catalog_ids() -> set[str]:
    catalog: set[str] = set()
    for path in sorted(DATA_DIR.glob("*.json")):
        if len(path.stem) != 2 or path.stem.upper() == "BR":
            continue
        try:
            properties = read_json(path, [])
        except Exception:
            continue
        for imovel in properties:
            property_id = str(imovel.get("numeroImovel") or "").strip()
            if property_id:
                catalog.add(property_id)
    return catalog


def already_gone(message: str) -> bool:
    """Detecta erro de objeto já inexistente (meta atingida por outra via)."""
    lowered = message.lower()
    return "(#100)" in lowered or "does not exist" in lowered or "not found" in lowered


def main() -> int:
    args = parser().parse_args()
    scopes = {uf.upper() for uf in args.uf} if args.uf else None

    catalog = load_catalog_ids()
    print(f"ℹ️ Catálogo atual: {len(catalog)} imóveis.")
    state = read_json(STATE_FILE, [])
    if not isinstance(state, list):
        print("❌ Histórico inválido (não é lista).")
        return 1

    stale = [
        item for item in state
        if isinstance(item, dict)
        and str(item.get("property_id") or "").strip() not in catalog
        and item.get("property_id")
        and item.get("status") != "removed"
        and (scopes is None or str(item.get("uf") or "").upper() in scopes)
    ]
    if not stale:
        print("✅ Nenhum post obsoleto: tudo publicado ainda está no catálogo.")
        return 0

    print(f"⚠️ {len(stale)} post(s) de imóveis fora do catálogo.")
    tokens = {} if args.dry_run else load_page_tokens()
    clients: dict[str, FacebookClient] = {}
    changed = False

    for item in stale:
        property_id = str(item["property_id"])
        post_id = str(item.get("post_id") or "").strip()
        scope = str(item.get("uf") or "").upper()
        if args.dry_run:
            print(f"[DRY-RUN] removeria post {post_id or 'sem post_id'} (imóvel {property_id}, escopo {scope})")
            continue
        if not post_id:
            item["status"] = "removed"
            item["removed_at"] = now_utc().isoformat()
            item["remove_detail"] = "sem post_id; nada a deletar na API"
            changed = True
            print(f"[{scope}] {property_id} | marcado como removido (sem post_id)")
            continue
        token = tokens.get(scope, "")
        if not token:
            print(f"[{scope}] {property_id} | NÃO REMOVIDO — token ausente")
            continue
        client = clients.setdefault(scope, FacebookClient(token))
        try:
            client.delete_post(post_id)
            item["status"] = "removed"
            item["removed_at"] = now_utc().isoformat()
            item["remove_detail"] = "deletado via Graph API DELETE"
            changed = True
            print(f"[{scope}] {property_id} | REMOVIDO — post {post_id}")
        except FacebookAPIError as exc:
            if already_gone(str(exc)):
                item["status"] = "removed"
                item["removed_at"] = now_utc().isoformat()
                item["remove_detail"] = f"já inexistente na página: {exc}"
                changed = True
                print(f"[{scope}] {property_id} | marcado como removido (já inexistente)")
            else:
                print(f"[{scope}] {property_id} | ERRO — {exc}")

    if changed:
        write_json(STATE_FILE, state[-1000:])
        print("💾 Histórico atualizado com status de remoção.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
