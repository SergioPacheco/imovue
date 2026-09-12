from __future__ import annotations

import argparse
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from social.compose_post import compose_post
    from social.config import (DATA_DIR, DEFAULT_MAX_DATA_AGE_HOURS, DEFAULT_MIN_DISCOUNT,
                               DEFAULT_RECENT_DAYS, OUTPUT_DIR, STATE_FILE, UF_NAMES,
                               load_page_tokens, load_pages)
    from social.facebook_client import FacebookAPIError, FacebookClient
    from social.generate_card import generate_card
    from social.selector import candidates
    from social.utils import now_utc, parse_datetime, property_url, read_json, write_json
else:
    from .compose_post import compose_post
    from .config import (DATA_DIR, DEFAULT_MAX_DATA_AGE_HOURS, DEFAULT_MIN_DISCOUNT,
                         DEFAULT_RECENT_DAYS, OUTPUT_DIR, STATE_FILE, UF_NAMES,
                         load_page_tokens, load_pages)
    from .facebook_client import FacebookAPIError, FacebookClient
    from .generate_card import generate_card
    from .selector import candidates
    from .utils import now_utc, parse_datetime, property_url, read_json, write_json


def parser() -> argparse.ArgumentParser:
    command = argparse.ArgumentParser(description="Seleciona e publica oportunidades do Imovue nas redes sociais.")
    scope = command.add_mutually_exclusive_group(required=True)
    scope.add_argument("--uf", action="append", metavar="UF", help="Processa uma UF; pode ser repetido.")
    scope.add_argument("--all", action="store_true", help="Processa todas as UFs do dataset.")
    mode = command.add_mutually_exclusive_group()
    mode.add_argument("--generate-only", action="store_true", help="Gera TXT/PNG sem publicar.")
    mode.add_argument("--dry-run", action="store_true", help="Seleciona e gera, mas não publica.")
    mode.add_argument("--publish", action="store_true", help="Publica nas páginas configuradas.")
    command.add_argument("--min-discount", type=float, default=DEFAULT_MIN_DISCOUNT)
    command.add_argument("--recent-days", type=int, default=DEFAULT_RECENT_DAYS)
    command.add_argument("--max-data-age-hours", type=int, default=DEFAULT_MAX_DATA_AGE_HOURS)
    command.add_argument("--allow-stale", action="store_true", help="Permite publicação com dataset antigo (uso excepcional).")
    return command


def data_age_hours() -> float | None:
    metadata_path = DATA_DIR / "meta.json"
    metadata = read_json(metadata_path, {})
    generated = parse_datetime(metadata.get("generatedAt")) if metadata else None
    if generated is None:
        manifest = DATA_DIR / "manifest.json"
        if not manifest.exists():
            return None
        generated = datetime.fromtimestamp(manifest.stat().st_mtime, tz=timezone.utc)
    return max(0.0, (now_utc() - generated).total_seconds() / 3600)


def available_ufs() -> list[str]:
    return sorted(path.stem.upper() for path in DATA_DIR.glob("*.json") if len(path.stem) == 2 and path.stem.upper() in UF_NAMES)


def load_local_recent_ids(days: int) -> set[str]:
    cutoff = now_utc() - timedelta(days=days)
    state = read_json(STATE_FILE, [])
    return {
        str(item["property_id"])
        for item in state
        if item.get("property_id") and (parse_datetime(item.get("published_at")) or now_utc()) >= cutoff
    }


def save_published(record: dict) -> None:
    state = read_json(STATE_FILE, [])
    if not isinstance(state, list):
        state = []
    state.append(record)
    write_json(STATE_FILE, state[-1000:])


def write_summary(results: list[dict]) -> None:
    lines = ["## Imovue Social Publisher", "", "| UF | Imóvel | Score | Ação | Detalhe |", "| --- | --- | ---: | --- | --- |"]
    for result in results:
        lines.append(f"| {result['uf']} | {result.get('property_id', '—')} | {result.get('score', '—')} | {result['action']} | {result.get('detail', '')} |")
    summary = "\n".join(lines) + "\n"
    summary_path = __import__("os").environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        with open(summary_path, "a", encoding="utf-8") as file:
            file.write(summary)


def main() -> int:
    args = parser().parse_args()
    mode = "publish" if args.publish else "generate-only" if args.generate_only else "dry-run"
    ufs = [uf.upper() for uf in args.uf] if args.uf else available_ufs()
    pages = load_pages()
    tokens = load_page_tokens() if mode == "publish" else {}
    local_recent = load_local_recent_ids(args.recent_days)
    age = data_age_hours()
    results = []

    if mode == "publish" and (age is None or age > args.max_data_age_hours) and not args.allow_stale:
        age_text = "desconhecida" if age is None else f"{age:.1f} horas"
        print(f"❌ Publicação bloqueada: dataset com idade {age_text}; limite {args.max_data_age_hours} horas.")
        print("   Atualize os dados ou use --allow-stale somente após conferência manual.")
        return 2
    if age is not None and age > args.max_data_age_hours:
        print(f"⚠️ Dataset antigo: {age:.1f} horas.")

    for uf in ufs:
        ranked = candidates(uf, args.min_discount, local_recent)
        if not ranked:
            result = {"uf": uf, "action": "NÃO PUBLICADO", "detail": "sem candidato elegível"}
            results.append(result)
            print(f"[{uf}] {result['detail']}")
            continue

        imovel, ranking = ranked[0]
        property_id = str(imovel["numeroImovel"])
        output_dir = OUTPUT_DIR / now_utc().date().isoformat()
        text_path = output_dir / f"{uf}.txt"
        image_path = output_dir / f"{uf}.png"
        text = compose_post(imovel, uf, ranking.total)
        text_path.parent.mkdir(parents=True, exist_ok=True)
        text_path.write_text(text + "\n", encoding="utf-8")
        generate_card(imovel, uf, ranking.total, image_path)

        result = {"uf": uf, "property_id": property_id, "score": ranking.total, "action": "NÃO PUBLICADO", "detail": mode.upper()}
        if mode == "publish":
            page = pages.get(uf, {})
            page_id = str(page.get("pageId") or "").strip()
            token = tokens.get(uf, "")
            if not page.get("enabled") or not page_id or not token:
                result["detail"] = "página desativada ou token ausente"
            else:
                try:
                    client = FacebookClient(token)
                    remote_recent = client.recent_property_ids(page_id, args.recent_days)
                    if property_id in remote_recent:
                        result["detail"] = "já publicado na página nos últimos dias"
                    else:
                        post_id = client.publish_card(page_id, image_path, text)
                        save_published({
                            "property_id": property_id,
                            "uf": uf,
                            "page_id": page_id,
                            "post_id": post_id,
                            "published_at": now_utc().isoformat(),
                            "url": property_url(imovel, uf),
                        })
                        result["action"] = "PUBLICADO"
                        result["detail"] = post_id or "sem post_id retornado"
                except FacebookAPIError as exc:
                    result["detail"] = str(exc)
        results.append(result)
        print(f"[{uf}] {property_id} | {ranking.total} pontos | {result['action']} — {result['detail']}")

    write_summary(results)
    return 0 if all(result["action"] != "ERRO" for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
