from __future__ import annotations

import argparse
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from social.compose_post import compose_post
    from social.config import (DATA_DIR, DEFAULT_MAX_DATA_AGE_HOURS, DEFAULT_MIN_DISCOUNT,
                               OUTPUT_DIR, SLOT_TOLERANCE_MINUTES, STATE_FILE, UF_NAMES,
                               facebook_timezone, load_page_tokens, load_pages,
                               posts_per_day, repost_after_days, schedule_for)
    from social.facebook_client import FacebookAPIError, FacebookClient
    from social.generate_card import generate_card, generate_story_card
    from social.selector import candidates, price_band, weighted_pick
    from social.utils import local_now, now_utc, parse_datetime, property_url, read_json, write_json
else:
    from .compose_post import compose_post
    from .config import (DATA_DIR, DEFAULT_MAX_DATA_AGE_HOURS, DEFAULT_MIN_DISCOUNT,
                         OUTPUT_DIR, SLOT_TOLERANCE_MINUTES, STATE_FILE, UF_NAMES,
                         facebook_timezone, load_page_tokens, load_pages,
                         posts_per_day, repost_after_days, schedule_for)
    from .facebook_client import FacebookAPIError, FacebookClient
    from .generate_card import generate_card, generate_story_card
    from .selector import candidates, price_band, weighted_pick
    from .utils import local_now, now_utc, parse_datetime, property_url, read_json, write_json


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
    command.add_argument("--recent-days", type=int, default=None,
                         help="Janela anti-duplicidade (padrão: IMOVUE_FACEBOOK_REPOST_AFTER_DAYS ou 30).")
    command.add_argument("--slot", metavar="HH:MM", default=None,
                         help="Força um slot da grade (ex: 10:00); ignora o horário atual.")
    command.add_argument("--top-n", type=int, default=20,
                         help="Tamanho do pool dos melhores ranqueados para o sorteio ponderado.")
    command.add_argument("--seed", type=int, default=None,
                         help="Semente para sorteio reprodutível (omitido = aleatório).")
    command.add_argument("--no-repeat-city-days", type=int, default=14,
                         help="Janela de anti-repetição por cidade/UF (0 desativa).")
    # Mantidos por compatibilidade; não bloqueiam mais a publicação.
    command.add_argument("--max-data-age-hours", type=int, default=DEFAULT_MAX_DATA_AGE_HOURS,
                         help="(Obsoleto) Mantido por compatibilidade; a idade do dataset é só informativa.")
    command.add_argument("--allow-stale", action="store_true",
                         help="(Obsoleto) Mantido por compatibilidade; não tem mais efeito.")
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
        # Só bloqueia o que foi publicado (ou registro legado sem status);
        # erro/skip nunca marca o imóvel como publicado.
        if item.get("property_id") and item.get("status", "published") == "published"
        and (parse_datetime(item.get("published_at")) or now_utc()) >= cutoff
    }


def save_published(record: dict) -> None:
    state = read_json(STATE_FILE, [])
    if not isinstance(state, list):
        state = []
    state.append(record)
    write_json(STATE_FILE, state[-1000:])


def resolve_slot(slots: tuple[str, ...], tz_name: str, forced: str | None) -> tuple[str, int] | None:
    """Devolve (slot, indice) devido agora, ou None fora de horário."""
    if forced:
        if forced not in slots:
            raise ValueError(f"slot {forced} fora da grade {list(slots)}")
        return forced, slots.index(forced)
    now = local_now(tz_name)
    today = now.date().isoformat()
    for index, slot in enumerate(slots):
        hour, minute = (int(part) for part in slot.split(":"))
        start = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        delta = (now - start).total_seconds() / 60
        if 0 <= delta < SLOT_TOLERANCE_MINUTES:
            return slot, index
    return None


def slot_key(tz_name: str) -> str:
    return local_now(tz_name).date().isoformat()


def slot_done(state: list, date: str, slot: str, scope: str) -> bool:
    return any(
        isinstance(item, dict)
        and item.get("status") == "published"
        and item.get("scheduled_for") == f"{date} {slot}"
        and str(item.get("uf") or "").upper() == scope
        for item in state
    )


def lookup_properties(wanted: set[str]) -> dict[str, dict]:
    """Resolve registros completos do catálogo para um conjunto de IDs."""
    found: dict[str, dict] = {}
    for path in sorted(DATA_DIR.glob("*.json")):
        if len(path.stem) != 2 or path.stem.upper() == "BR":
            continue
        try:
            properties = read_json(path, [])
        except Exception:
            continue
        for imovel in properties:
            pid = str(imovel.get("numeroImovel") or "").strip()
            if pid in wanted and pid not in found:
                found[pid] = imovel
            if len(found) >= len(wanted):
                return found
    return found


def today_picks(state: list, date: str, scope: str) -> list[dict]:
    """Imóveis publicados hoje (para variedade intra-dia), com campos do catálogo."""
    picks = [
        item for item in state
        if isinstance(item, dict)
        and item.get("status") == "published"
        and str(item.get("scheduled_for") or "").startswith(date)
        and str(item.get("uf") or "").upper() == scope
    ]
    if not picks:
        return []
    catalog = lookup_properties({str(p["property_id"]) for p in picks if p.get("property_id")})
    enriched = []
    for pick in picks:
        imovel = catalog.get(str(pick.get("property_id")), {})
        enriched.append({
            "uf_imovel": str(pick.get("uf_imovel") or imovel.get("uf") or "").strip().upper(),
            "cidade": str(pick.get("cidade") or imovel.get("cidade") or "").strip().upper(),
            "bairro": str(pick.get("bairro") or imovel.get("bairro") or "").strip().upper(),
            "tipo": str(pick.get("tipo") or imovel.get("tipoImovel") or "").strip().upper(),
            "faixa": str(pick.get("faixa") or price_band(imovel.get("precoVenda")) or "").strip(),
        })
    return enriched


def recent_city_uf_sets(days: int) -> tuple[set[str], set[str]]:
    """Cidades/UFs publicadas na janela de diversidade (para anti-repetição)."""
    if days <= 0:
        return set(), set()
    cutoff = now_utc() - timedelta(days=days)
    state = read_json(STATE_FILE, [])
    if not isinstance(state, list):
        return set(), set()
    cities: set[str] = set()
    ufs: set[str] = set()
    missing_ids: list[str] = []
    for item in state:
        if not isinstance(item, dict):
            continue
        published = parse_datetime(item.get("published_at")) or now_utc()
        if published < cutoff:
            continue
        city = str(item.get("cidade") or "").strip().upper()
        imovel_uf = str(item.get("uf_imovel") or item.get("uf") or "").strip().upper()
        # Registros antigos guardam em "uf" o escopo (ex: BR); a UF real do
        # imóvel só existe nos registros novos ("uf_imovel").
        if city:
            cities.add(city)
        if city and len(imovel_uf) == 2 and imovel_uf != "BR":
            ufs.add(imovel_uf)
        elif not city and item.get("property_id"):
            missing_ids.append(str(item["property_id"]))
    if missing_ids:
        index = _property_location_index(set(missing_ids))
        for pid in missing_ids:
            city, imovel_uf = index.get(pid, ("", ""))
            if city:
                cities.add(city)
            if imovel_uf:
                ufs.add(imovel_uf)
    return cities, ufs


def _property_location_index(wanted: set[str]) -> dict[str, tuple[str, str]]:
    """Resolve (cidade, UF) para property_ids consultando os JSONs por UF."""
    found: dict[str, tuple[str, str]] = {}
    for path in sorted(DATA_DIR.glob("*.json")):
        if len(path.stem) != 2 or path.stem.upper() == "BR":
            continue
        try:
            properties = read_json(path, [])
        except Exception:
            continue
        for imovel in properties:
            pid = str(imovel.get("numeroImovel") or "").strip()
            if pid in wanted and pid not in found:
                found[pid] = (
                    str(imovel.get("cidade") or "").strip().upper(),
                    str(imovel.get("uf") or path.stem.upper()).strip().upper(),
                )
            if len(found) >= len(wanted):
                return found
    return found


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
    per_day = posts_per_day()
    slots = schedule_for(per_day)
    tz_name = facebook_timezone()
    recent_days = args.recent_days if args.recent_days else repost_after_days()
    try:
        resolved = resolve_slot(slots, tz_name, args.slot)
    except ValueError as exc:
        print(f"❌ {exc}")
        return 2
    if resolved is None:
        print(f"ℹ️ Fora de horário (grade {per_day}/dia em {tz_name}: {', '.join(slots)}). Nada a fazer.")
        return 0
    slot, slot_index = resolved
    today = slot_key(tz_name)

    ufs = [uf.upper() for uf in args.uf] if args.uf else available_ufs()
    pages = load_pages()
    tokens = load_page_tokens() if mode == "publish" else {}
    local_recent = load_local_recent_ids(recent_days)
    age = data_age_hours()
    results = []
    rng = random.Random(args.seed)
    state = read_json(STATE_FILE, [])
    if not isinstance(state, list):
        state = []

    # A idade do dataset é apenas informativa: sem trava de frescor.
    if age is None:
        print("ℹ️ Idade do dataset desconhecida (sem meta.json/manifest); seguindo sem bloqueio.")
    else:
        print(f"ℹ️ Dataset com {age:.1f} horas.")
    print(f"ℹ️ Slot {slot} ({slot_index + 1}/{per_day}) em {tz_name} | anti-duplicidade {recent_days}d.")
    recent_cities, recent_ufs = recent_city_uf_sets(args.no_repeat_city_days)

    for uf in ufs:
        if slot_done(state, today, slot, uf):
            result = {"uf": uf, "action": "NÃO PUBLICADO", "detail": f"slot {slot} já publicado hoje"}
            results.append(result)
            print(f"[{uf}] {result['detail']}")
            continue
        ranked = candidates(uf, args.min_discount, local_recent)
        if not ranked:
            result = {"uf": uf, "action": "NÃO PUBLICADO", "detail": "sem candidato elegível"}
            results.append(result)
            print(f"[{uf}] {result['detail']}")
            continue

        pool_size = min(max(1, args.top_n), len(ranked))
        (imovel, ranking), pick_index = weighted_pick(
            ranked, top_n=pool_size, rng=rng,
            recent_cities=recent_cities, recent_ufs=recent_ufs,
            same_day=today_picks(state, today, uf),
        )
        property_id = str(imovel["numeroImovel"])
        output_dir = OUTPUT_DIR / now_utc().date().isoformat()
        text_path = output_dir / f"{uf}.txt"
        image_path = output_dir / f"{uf}.png"
        story_path = output_dir / f"{uf}_story.png"
        text = compose_post(imovel, uf, ranking.total, slot_index)
        text_path.parent.mkdir(parents=True, exist_ok=True)
        text_path.write_text(text + "\n", encoding="utf-8")
        generate_card(imovel, uf, ranking.total, image_path)
        generate_story_card(imovel, uf, story_path)

        scheduled_for = f"{today} {slot}"
        result = {"uf": uf, "property_id": property_id, "score": ranking.total, "action": "NÃO PUBLICADO", "detail": f"{mode.upper()} slot {slot}"}
        if mode == "publish":
            page = pages.get(uf, {})
            page_id = str(page.get("pageId") or "").strip()
            token = tokens.get(uf, "")
            if not page.get("enabled") or not page_id or not token:
                result["detail"] = "página desativada ou token ausente"
                _record(state, imovel, uf, page_id, "", scheduled_for, tz_name, "skipped", result["detail"])
            else:
                try:
                    client = FacebookClient(token)
                    remote_recent = client.recent_property_ids(page_id, recent_days)
                    if property_id in remote_recent:
                        result["detail"] = "já publicado na página nos últimos dias"
                        _record(state, imovel, uf, page_id, "", scheduled_for, tz_name, "skipped", result["detail"])
                    else:
                        post_id = client.publish_card(page_id, image_path, text)
                        _record(state, imovel, uf, page_id, post_id, scheduled_for, tz_name, "published", "")
                        result["action"] = "PUBLICADO"
                        result["detail"] = post_id or "sem post_id retornado"
                except FacebookAPIError as exc:
                    # Falha registrada sem o token; imóvel NÃO marcado como publicado.
                    _record(state, imovel, uf, page_id, "", scheduled_for, tz_name, "error", _safe_error(exc))
                    result["detail"] = f"ERRO: {_safe_error(exc)}"
                    result["action"] = "ERRO"
        results.append(result)
        print(f"[{uf} {slot}] {property_id} | {ranking.total} pontos "
              f"(#{pick_index + 1}/{pool_size} sorteado, pool top-{pool_size}) | "
              f"{result['action']} — {result['detail']}")

    write_summary(results)
    return 0 if all(result["action"] != "ERRO" for result in results) else 1


def _record(state: list, imovel: dict, uf: str, page_id: str, post_id: str,
            scheduled_for: str, tz_name: str, status: str, error: str) -> None:
    state.append({
        "property_id": str(imovel.get("numeroImovel")),
        "uf": uf,
        "uf_imovel": str(imovel.get("uf") or "").strip().upper(),
        "cidade": str(imovel.get("cidade") or "").strip().upper(),
        "bairro": str(imovel.get("bairro") or "").strip().upper(),
        "tipo": str(imovel.get("tipoImovel") or "").strip().upper(),
        "faixa": price_band(imovel.get("precoVenda")),
        "page_id": page_id,
        "post_id": post_id,
        "scheduled_for": scheduled_for,
        "published_at": now_utc().isoformat() if status == "published" else "",
        "timezone": tz_name,
        "status": status,
        "error": error,
        "url": property_url(imovel, uf),
    })
    write_json(STATE_FILE, state[-1000:])


def _safe_error(exc: Exception) -> str:
    """Mensagem sem segredos (o token nunca entra na exceção da API)."""
    text = str(exc)
    for secret in ("access_token", "META_PAGE_TOKEN"):
        text = text.replace(secret, "***")
    return text[:300]


if __name__ == "__main__":
    raise SystemExit(main())
