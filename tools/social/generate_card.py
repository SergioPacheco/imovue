"""Cards de anúncio Imovue — identidade premium para feed e story.

Feed: 1080×1350 (4:5) · Story: 1080×1920 (9:16).
Fundo: asset próprio reutilizável (sem informação do imóvel) com fallback
em gradiente caso o arquivo não exista. Todo texto vem do dataset;
nenhuma frase comercial é inventada. Não há botão nem elemento clicável
na arte — a imagem do Facebook não é clicável por região.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .utils import area as format_area
from .utils import currency, display_name

FEED_SIZE = (1080, 1350)
STORY_SIZE = (1080, 1920)

NAVY_DEEP = "#051C39"
NAVY = "#0F365B"
AMBER = "#F59E0B"
WHITE = "#FFFFFF"
LIGHT = "#CBD5E1"
MUTED = "#94A3B8"
STRIKE = "#64748B"

MARGIN = 64
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")
ASSET_DIR = Path(__file__).resolve().parent / "assets"
BACKGROUND_ASSET = ASSET_DIR / "imovue-social-background-1080x1350.png"


def font(size: int, bold: bool = False, serif: bool = False):
    candidates = []
    if serif:
        candidates.append("DejaVuSerif-Bold.ttf" if bold else "DejaVuSerif.ttf")
    else:
        candidates.append("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")
    for name in candidates:
        try:
            return ImageFont.truetype(str(FONT_DIR / name), size)
        except OSError:
            continue
    return ImageFont.load_default()


def text_width(draw: ImageDraw.ImageDraw, text: str, selected: ImageFont.ImageFont) -> int:
    return int(draw.textlength(text, font=selected))


def fit_font(text: str, max_width: int, initial: int, bold: bool = False,
             serif: bool = False, minimum: int = 28):
    size = initial
    probe = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    while size > minimum:
        selected = font(size, bold, serif)
        if probe.textlength(text, font=selected) <= max_width:
            return selected
        size -= 4
    return font(minimum, bold, serif)


def wrap_lines(text: str, max_width: int, size: int, bold: bool = False,
               serif: bool = False, max_lines: int = 2, minimum: int = 48) -> tuple[list[str], object]:
    """Uma linha sempre que couber (encolhendo até 72 ou `minimum`); senão
    2 linhas balanceadas sem deixar '· UF' órfã sozinha na segunda linha."""
    probe = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    floor_single = max(72, minimum)
    current = size
    while current >= floor_single:
        selected = font(current, bold, serif)
        if probe.textlength(text, font=selected) <= max_width:
            return [text], selected
        current -= 6
    # Textos curtos encolhem um pouco mais em 1 linha em vez de quebrar.
    if len(text) <= 20:
        selected = _shrink_single(probe, text, max_width, bold, serif, 60)[1]
        if probe.textlength(text, font=selected) <= max_width:
            return [text], selected
    selected = font(current, bold, serif)
    if probe.textlength(text, font=selected) <= max_width:
        return [text], selected
    words = text.split()
    if len(words) < 2 or max_lines < 2:
        return _shrink_single(probe, text, max_width, bold, serif, minimum)
    best: list[str] | None = None
    best_score = float("inf")
    for split in range(1, len(words)):
        lines = [" ".join(words[:split]), " ".join(words[split:])]
        if all(probe.textlength(line, font=selected) <= max_width for line in lines):
            penalty = max(len(line) for line in lines)
            if lines[1].startswith("·") or len(lines[1]) < 4:
                penalty += 1000
            if penalty < best_score:
                best, best_score = lines, penalty
    if best:
        return best, selected
    return _shrink_single(probe, text, max_width, bold, serif, minimum)


def _shrink_single(probe: ImageDraw.ImageDraw, text: str, max_width: int,
                   bold: bool, serif: bool, minimum: int) -> tuple[list[str], object]:
    current = 64
    while current >= minimum:
        selected = font(current, bold, serif)
        if probe.textlength(text, font=selected) <= max_width:
            return [text], selected
        current -= 4
    selected = font(minimum, bold, serif)
    truncated = text
    while truncated and probe.textlength(truncated + "…", font=selected) > max_width:
        truncated = truncated[:-1]
    return [truncated + "…" if truncated != text else text], selected


def draw_tracked(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str,
                 selected: ImageFont.ImageFont, fill: str, tracking: int = 8) -> int:
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=selected, fill=fill)
        x += draw.textlength(char, font=selected) + tracking
    return int(x - xy[0] - tracking)


def offer_texts(imovel: dict, scope_uf: str) -> dict:
    """Todos os textos do card, derivados exclusivamente do dataset."""
    tipo = (display_name(imovel.get("tipoImovel") or "Imóvel")).upper()
    cidade = display_name(imovel.get("cidade") or "Cidade não informada")
    imovel_uf = str(imovel.get("uf") or scope_uf or "").strip().upper()
    bairro = display_name(imovel.get("bairro"))
    try:
        discount = float(imovel.get("percentualDesconto") or 0)
    except (TypeError, ValueError):
        discount = 0.0
    modalidade = display_name(imovel.get("modalidadeVenda") or "")
    facts: list[tuple[str, str]] = []
    property_area = imovel.get("areaPrivativa") or imovel.get("areaTotal") or imovel.get("areaTerreno")
    if property_area:
        try:
            if float(property_area) > 0:
                facts.append(("area", format_area(property_area)))
        except (TypeError, ValueError):
            pass
    try:
        quartos = int(float(imovel["quartos"])) if imovel.get("quartos") else 0
    except (TypeError, ValueError):
        quartos = 0
    if quartos > 0:
        facts.append(("bed", f"{quartos} quarto" if quartos == 1 else f"{quartos} quartos"))
    try:
        vagas = int(float(imovel["vagas"])) if imovel.get("vagas") else 0
    except (TypeError, ValueError):
        vagas = 0
    if vagas > 0:
        facts.append(("park", f"{vagas} vaga" if vagas == 1 else f"{vagas} vagas"))
    return {
        "tipo": tipo,
        "cidade_uf": f"{cidade} · {imovel_uf}" if imovel_uf else cidade,
        "bairro": bairro,
        "preco": currency(imovel.get("precoVenda")),
        "avaliacao": currency(imovel.get("valorAvaliacao")) if imovel.get("valorAvaliacao") else "",
        "desconto": f"−{discount:.0f}%" if discount > 0 else "",
        "modalidade": modalidade,
        "facts": facts[:3],
    }


def load_background(size: tuple[int, int]) -> Image.Image:
    """Asset próprio em tela cheia; gradiente navy como fallback robusto."""
    width, height = size
    if BACKGROUND_ASSET.exists():
        try:
            asset = Image.open(BACKGROUND_ASSET).convert("RGB")
            if asset.size == size:
                return asset
            scale = max(width / asset.width, height / asset.height)
            resized = asset.resize((int(asset.width * scale) + 1, int(asset.height * scale) + 1), Image.LANCZOS)
            left = (resized.width - width) // 2
            top = (resized.height - height) // 2
            return resized.crop((left, top, left + width, top + height))
        except OSError:
            pass
    base = Image.new("RGB", size, NAVY_DEEP)
    draw = ImageDraw.Draw(base)
    top_color = Image.new("RGB", (1, 1), NAVY_DEEP).getpixel((0, 0))
    bottom_color = Image.new("RGB", (1, 1), NAVY).getpixel((0, 0))
    for y in range(height):
        ratio = y / max(1, height - 1)
        draw.line([(0, y), (width, y)],
                  fill=tuple(int(a + (b - a) * ratio) for a, b in zip(top_color, bottom_color)))
    return base


def draw_brand(draw: ImageDraw.ImageDraw, x: int, y: int, size: int = 78) -> None:
    selected = font(size, True)
    draw.text((x, y), "Imo", font=selected, fill=WHITE)
    draw.text((x + draw.textlength("Imo", font=selected), y), "vue", font=selected, fill=AMBER)


def icon_house(draw: ImageDraw.ImageDraw, x: int, y: int, s: int, color: str, width: int = 4) -> None:
    draw.line([(x, y + s * 0.45), (x + s / 2, y + s * 0.1)], fill=color, width=width)
    draw.line([(x + s / 2, y + s * 0.1), (x + s, y + s * 0.45)], fill=color, width=width)
    draw.rectangle((x + s * 0.22, y + s * 0.42, x + s * 0.78, y + s * 0.9), outline=color, width=width)


def icon_globe(draw: ImageDraw.ImageDraw, x: int, y: int, s: int, color: str, width: int = 3) -> None:
    draw.ellipse((x, y, x + s, y + s), outline=color, width=width)
    draw.ellipse((x + s * 0.28, y, x + s * 0.72, y + s), outline=color, width=width)
    draw.line([(x, y + s / 2), (x + s, y + s / 2)], fill=color, width=width)


def icon_area(draw: ImageDraw.ImageDraw, x: int, y: int, s: int, color: str, width: int = 4) -> None:
    draw.rectangle((x, y + s * 0.1, x + s * 0.9, y + s), outline=color, width=width)
    draw.line([(x + s * 0.9, y), (x + s * 0.9, y + s * 0.35)], fill=color, width=width)
    draw.line([(x + s * 0.65, y), (x + s * 0.9, y)], fill=color, width=width)


def icon_bed(draw: ImageDraw.ImageDraw, x: int, y: int, s: int, color: str, width: int = 4) -> None:
    draw.line([(x, y + s), (x, y + s * 0.35)], fill=color, width=width)
    draw.line([(x, y + s * 0.55), (x + s, y + s * 0.55)], fill=color, width=width)
    draw.line([(x + s, y + s * 0.55), (x + s, y + s)], fill=color, width=width)
    draw.line([(x, y + s), (x + s, y + s)], fill=color, width=width)
    draw.line([(x + s * 0.12, y + s * 0.55), (x + s * 0.35, y + s * 0.55)], fill=color, width=width)


def icon_park(draw: ImageDraw.ImageDraw, x: int, y: int, s: int, color: str, width: int = 4) -> None:
    draw.rounded_rectangle((x, y + s * 0.05, x + s * 0.95, y + s), radius=10, outline=color, width=width)
    draw.text((x + s * 0.47, y + s * 0.52), "P", font=font(int(s * 0.62), True), fill=color, anchor="mm")


ICONS = {"house": icon_house, "globe": icon_globe, "area": icon_area, "bed": icon_bed, "park": icon_park}


def draw_offer_badge(draw: ImageDraw.ImageDraw, x: int, y: int) -> int:
    """Pill 'OFERTA CAIXA': contorno âmbar, fundo transparente. Não é botão."""
    label = "OFERTA CAIXA"
    selected = font(34, True)
    label_w = text_width(draw, label, selected)
    icon_s = 40
    gap = 18
    pad_x, pad_y = 34, 22
    height = max(icon_s, 48) + pad_y * 2
    width = pad_x + icon_s + gap + label_w + pad_x
    draw.rounded_rectangle((x, y, x + width, y + height), radius=height // 2, outline=AMBER, width=3)
    icon_house(draw, x + pad_x, y + (height - icon_s) // 2, icon_s, AMBER)
    draw.text((x + pad_x + icon_s + gap, y + height // 2), label, font=selected, fill=AMBER, anchor="lm")
    return int(y + height)


def draw_location(draw: ImageDraw.ImageDraw, x: int, y: int, texts: dict, max_width: int) -> int:
    cursor = y
    draw_tracked(draw, (x, cursor), texts["tipo"], font(38, True), AMBER, tracking=10)
    cursor += 38 + 30
    lines, title_font = wrap_lines(texts["cidade_uf"], max_width, 108, bold=True, serif=True)
    for line in lines:
        draw.text((x, cursor), line, font=title_font, fill=WHITE)
        cursor += title_font.size + 8
    cursor += 12
    if texts["bairro"]:
        bairro_lines, bairro_font = wrap_lines(texts["bairro"], max_width, 44, minimum=30)
        for line in bairro_lines:
            draw.text((x, cursor), line, font=bairro_font, fill=LIGHT)
            cursor += bairro_font.size + 8
        cursor += 18
    else:
        cursor += 6
    draw.line([(x, cursor), (x + 72, cursor)], fill=AMBER, width=5)
    return cursor + 26


def draw_price_panel(image: Image.Image, x: int, top: int, width: int, texts: dict) -> int:
    draw = ImageDraw.Draw(image)
    pad = 48
    inner = width - pad * 2
    badge_h = 80 if texts["desconto"] else 0
    price_font = fit_font(texts["preco"], inner, 128, bold=True)
    old_h = 60 if texts["avaliacao"] else 0
    content = pad + (badge_h + 24 if badge_h else 0) + price_font.size + 12 + old_h + pad - 16
    draw.rounded_rectangle((x, top, x + width, top + content), radius=42, fill=WHITE)
    y = top + pad
    if texts["desconto"]:
        badge_font = font(44, True)
        badge_w = text_width(draw, texts["desconto"], badge_font) + 60
        draw.rounded_rectangle((x + pad, y, x + pad + badge_w, y + badge_h), radius=26, fill=AMBER)
        draw.text((x + pad + 30, y + badge_h // 2), texts["desconto"], font=badge_font, fill=NAVY_DEEP, anchor="lm")
        y += badge_h + 24
    draw.text((x + pad, y), texts["preco"], font=price_font, fill=NAVY_DEEP)
    y += price_font.size + 12
    if texts["avaliacao"]:
        old_font = font(46)
        old_text = f"de {texts['avaliacao']}"
        draw.text((x + pad, y), old_text, font=old_font, fill=STRIKE)
        line_y = y + 32
        draw.line([(x + pad, line_y), (x + pad + text_width(draw, old_text, old_font), line_y)], fill=STRIKE, width=3)
    return int(top + content)


def draw_property_facts(draw: ImageDraw.ImageDraw, x: int, y: int,
                        facts: list[tuple[str, str]], max_y: int) -> int:
    """Linhas factuais com ícones lineares; só entra o que existe no dataset
    e o que couber acima do rodapé (nunca sobrepõe)."""
    cursor = y
    for kind, text in facts:
        if cursor + 70 > max_y:
            break
        icon_s = 44
        ICONS[kind](draw, x, cursor, icon_s, AMBER)
        draw.text((x + icon_s + 26, cursor + icon_s // 2), text, font=font(40), fill=LIGHT, anchor="lm")
        cursor += icon_s + 26
    return cursor


def draw_footer(draw: ImageDraw.ImageDraw, width: int, y: int, modalidade: str) -> None:
    """Rodapé editorial com filete âmbar. Informação de endereço, não botão."""
    draw.line([(MARGIN, y), (width - MARGIN, y)], fill=AMBER, width=3)
    row_y = y + 52
    icon_s = 46
    globe_x = width - MARGIN - icon_s
    draw.text((MARGIN, row_y), "Acesse", font=font(40), fill=WHITE, anchor="lm")
    acesse_w = text_width(draw, "Acesse", font(40))
    site_font = font(40, True)
    site = "imovue.com.br"
    draw.text((MARGIN + acesse_w + 16, row_y), site, font=site_font, fill=AMBER, anchor="lm")
    cursor = MARGIN + acesse_w + 16 + text_width(draw, site, site_font) + 28
    if modalidade:
        draw.text((cursor, row_y), "|", font=font(40), fill=MUTED, anchor="lm")
        cursor += text_width(draw, "|", font(40)) + 28
        avail = globe_x - 28 - cursor
        if avail < 200 and len(modalidade) > 20:
            modalidade = modalidade[:18].rstrip() + "…"
            avail = globe_x - 28 - cursor
        mod_font = fit_font(modalidade, max(avail, 60), 40)
        draw.text((cursor, row_y), modalidade, font=mod_font, fill=LIGHT, anchor="lm")
    icon_globe(draw, globe_x, row_y - icon_s // 2, icon_s, AMBER)


def generate_feed_card(imovel: dict, scope_uf: str, output: Path) -> Path:
    width, height = FEED_SIZE
    texts = offer_texts(imovel, scope_uf)
    image = load_background(FEED_SIZE)
    draw = ImageDraw.Draw(image)
    zone = 640

    draw_brand(draw, MARGIN, 88, 78)
    badge_bottom = draw_offer_badge(draw, MARGIN, 200)
    cursor = draw_location(draw, MARGIN, badge_bottom + 44, texts, zone)
    panel_bottom = draw_price_panel(image, MARGIN, cursor + 30, zone, texts)
    draw = ImageDraw.Draw(image)
    draw_property_facts(draw, MARGIN, panel_bottom + 32, texts["facts"], height - 132 - 24)
    draw_footer(draw, width, height - 132, texts["modalidade"])

    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, format="PNG", optimize=True)
    return output


def generate_story_card(imovel: dict, scope_uf: str, output: Path) -> Path:
    width, height = STORY_SIZE
    texts = offer_texts(imovel, scope_uf)
    image = load_background(STORY_SIZE)
    # Véu escuro à esquerda garante legibilidade sobre o prédio ampliado.
    scrim = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    veil = ImageDraw.Draw(scrim)
    for x in range(int(width * 0.78)):
        alpha = int(150 * (1 - x / (width * 0.78)))
        veil.line([(x, 0), (x, height)], fill=(5, 28, 57, alpha))
    image = Image.alpha_composite(image.convert("RGBA"), scrim).convert("RGB")
    draw = ImageDraw.Draw(image)

    draw_brand(draw, MARGIN, 120, 78)
    badge_bottom = draw_offer_badge(draw, MARGIN, 232)
    cursor = draw_location(draw, MARGIN, badge_bottom + 48, texts, width - MARGIN * 2)
    panel_bottom = draw_price_panel(image, MARGIN, cursor + 36, width - MARGIN * 2, texts)
    draw = ImageDraw.Draw(image)
    draw_property_facts(draw, MARGIN, panel_bottom + 48, texts["facts"], height - 320 - 30)
    draw_footer(draw, width, height - 320, texts["modalidade"])

    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, format="PNG", optimize=True)
    return output


def generate_card(imovel: dict, uf: str, score: float, output: Path) -> Path:
    """Compatibilidade com o publicador: gera a versão feed."""
    return generate_feed_card(imovel, uf, output)
