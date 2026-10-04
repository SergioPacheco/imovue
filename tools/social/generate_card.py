"""Cards de anúncio Imovue — identidade premium para feed e story.

Feed: 1080×1350 (4:5) · Story: 1080×1920 (9:16).
Fundo: asset próprio reutilizável (sem informação do imóvel) com fallback
em gradiente caso o arquivo não exista. Todo texto vem do dataset;
nenhuma frase comercial é inventada. Não há botão nem elemento clicável
na arte — a imagem do Facebook não é clicável por região.
"""

from __future__ import annotations

import dataclasses
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


@dataclasses.dataclass(frozen=True)
class Palette:
    """Cores de um tema. Claro/premium mudam só a paleta; hero muda o layout."""
    bg_top: str
    bg_bottom: str
    use_asset: bool
    brand_a: str
    brand_b: str
    accent: str
    text: str
    subtext: str
    muted: str
    panel_bg: str
    panel_text: str
    badge_bg: str
    badge_text: str
    strike: str


PALETTES = {
    "premium": Palette(
        bg_top=NAVY_DEEP, bg_bottom=NAVY, use_asset=True,
        brand_a=WHITE, brand_b=AMBER, accent=AMBER,
        text=WHITE, subtext=LIGHT, muted=MUTED,
        panel_bg=WHITE, panel_text=NAVY_DEEP,
        badge_bg=AMBER, badge_text=NAVY_DEEP, strike=STRIKE,
    ),
    "claro": Palette(
        bg_top="#FFFFFF", bg_bottom="#E2E8F0", use_asset=False,
        brand_a=NAVY_DEEP, brand_b="#B45309", accent="#B45309",
        text=NAVY_DEEP, subtext="#334155", muted=MUTED,
        panel_bg=NAVY_DEEP, panel_text=WHITE,
        badge_bg="#B45309", badge_text=WHITE, strike="#CBD5E1",
    ),
    # Hero usa a base escura; a diferença está no layout (desconto gigante).
    "desconto-hero": Palette(
        bg_top=NAVY_DEEP, bg_bottom=NAVY, use_asset=True,
        brand_a=WHITE, brand_b=AMBER, accent=AMBER,
        text=WHITE, subtext=LIGHT, muted=MUTED,
        panel_bg=WHITE, panel_text=NAVY_DEEP,
        badge_bg=AMBER, badge_text=NAVY_DEEP, strike=STRIKE,
    ),
}


def palette_for(theme: str) -> Palette:
    return PALETTES.get(theme) or PALETTES["premium"]

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


def load_background(size: tuple[int, int], palette: Palette) -> Image.Image:
    """Asset próprio em tela cheia (só temas escuros); senão gradiente da paleta."""
    width, height = size
    if palette.use_asset and BACKGROUND_ASSET.exists():
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
    base = Image.new("RGB", size, palette.bg_top)
    draw = ImageDraw.Draw(base)
    top_color = Image.new("RGB", (1, 1), palette.bg_top).getpixel((0, 0))
    bottom_color = Image.new("RGB", (1, 1), palette.bg_bottom).getpixel((0, 0))
    for y in range(height):
        ratio = y / max(1, height - 1)
        draw.line([(0, y), (width, y)],
                  fill=tuple(int(a + (b - a) * ratio) for a, b in zip(top_color, bottom_color)))
    return base


def draw_brand(draw: ImageDraw.ImageDraw, x: int, y: int, palette: Palette, size: int = 78) -> None:
    selected = font(size, True)
    draw.text((x, y), "Imo", font=selected, fill=palette.brand_a)
    draw.text((x + draw.textlength("Imo", font=selected), y), "vue", font=selected, fill=palette.brand_b)


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


def draw_offer_badge(draw: ImageDraw.ImageDraw, x: int, y: int, palette: Palette) -> int:
    """Pill 'OFERTA CAIXA': contorno na cor de destaque, fundo transparente. Não é botão."""
    label = "OFERTA CAIXA"
    selected = font(34, True)
    label_w = text_width(draw, label, selected)
    icon_s = 40
    gap = 18
    pad_x, pad_y = 34, 22
    height = max(icon_s, 48) + pad_y * 2
    width = pad_x + icon_s + gap + label_w + pad_x
    draw.rounded_rectangle((x, y, x + width, y + height), radius=height // 2, outline=palette.accent, width=3)
    icon_house(draw, x + pad_x, y + (height - icon_s) // 2, icon_s, palette.accent)
    draw.text((x + pad_x + icon_s + gap, y + height // 2), label, font=selected, fill=palette.accent, anchor="lm")
    return int(y + height)


def draw_location(draw: ImageDraw.ImageDraw, x: int, y: int, texts: dict,
                  max_width: int, palette: Palette, title_size: int = 108) -> int:
    cursor = y
    draw_tracked(draw, (x, cursor), texts["tipo"], font(38, True), palette.accent, tracking=10)
    cursor += 38 + 30
    lines, title_font = wrap_lines(texts["cidade_uf"], max_width, title_size, bold=True, serif=True)
    for line in lines:
        draw.text((x, cursor), line, font=title_font, fill=palette.text)
        cursor += title_font.size + 8
    cursor += 12
    if texts["bairro"]:
        bairro_lines, bairro_font = wrap_lines(texts["bairro"], max_width, 44, minimum=30)
        for line in bairro_lines:
            draw.text((x, cursor), line, font=bairro_font, fill=palette.subtext)
            cursor += bairro_font.size + 8
        cursor += 18
    else:
        cursor += 6
    draw.line([(x, cursor), (x + 72, cursor)], fill=palette.accent, width=5)
    return cursor + 26


def draw_discount_hero(draw: ImageDraw.ImageDraw, x: int, y: int, texts: dict,
                       max_width: int, palette: Palette) -> int:
    """Desconto gigante como protagonista (tema desconto-hero)."""
    hero_font = fit_font(texts["desconto"], max_width, 250, bold=True, minimum=120)
    draw.text((x, y), texts["desconto"], font=hero_font, fill=palette.accent)
    cursor = y + hero_font.size + 6
    caption_font = font(40, True)
    draw.text((x, cursor), "DE DESCONTO", font=caption_font, fill=palette.text)
    return cursor + caption_font.size + 28


def draw_price_panel(image: Image.Image, x: int, top: int, width: int,
                     texts: dict, palette: Palette, show_badge: bool = True) -> int:
    draw = ImageDraw.Draw(image)
    pad = 48
    inner = width - pad * 2
    badge_h = 80 if (show_badge and texts["desconto"]) else 0
    price_font = fit_font(texts["preco"], inner, 128, bold=True)
    old_h = 60 if texts["avaliacao"] else 0
    content = pad + (badge_h + 24 if badge_h else 0) + price_font.size + 12 + old_h + pad - 16
    draw.rounded_rectangle((x, top, x + width, top + content), radius=42, fill=palette.panel_bg)
    y = top + pad
    if badge_h:
        badge_font = font(44, True)
        badge_w = text_width(draw, texts["desconto"], badge_font) + 60
        draw.rounded_rectangle((x + pad, y, x + pad + badge_w, y + badge_h), radius=26, fill=palette.badge_bg)
        draw.text((x + pad + 30, y + badge_h // 2), texts["desconto"], font=badge_font, fill=palette.badge_text, anchor="lm")
        y += badge_h + 24
    draw.text((x + pad, y), texts["preco"], font=price_font, fill=palette.panel_text)
    y += price_font.size + 12
    if texts["avaliacao"]:
        old_font = font(46)
        old_text = f"de {texts['avaliacao']}"
        draw.text((x + pad, y), old_text, font=old_font, fill=palette.strike)
        line_y = y + 32
        draw.line([(x + pad, line_y), (x + pad + text_width(draw, old_text, old_font), line_y)], fill=palette.strike, width=3)
    return int(top + content)


def draw_property_facts(draw: ImageDraw.ImageDraw, x: int, y: int,
                        facts: list[tuple[str, str]], max_y: int, palette: Palette) -> int:
    """Linhas factuais com ícones lineares; só entra o que existe no dataset
    e o que couber acima do rodapé (nunca sobrepõe)."""
    cursor = y
    for kind, text in facts:
        if cursor + 70 > max_y:
            break
        icon_s = 44
        ICONS[kind](draw, x, cursor, icon_s, palette.accent)
        draw.text((x + icon_s + 26, cursor + icon_s // 2), text, font=font(40), fill=palette.subtext, anchor="lm")
        cursor += icon_s + 26
    return cursor


def draw_footer(draw: ImageDraw.ImageDraw, width: int, y: int, modalidade: str, palette: Palette) -> None:
    """Rodapé editorial com filete na cor de destaque. Informação de endereço, não botão."""
    draw.line([(MARGIN, y), (width - MARGIN, y)], fill=palette.accent, width=3)
    row_y = y + 52
    icon_s = 46
    globe_x = width - MARGIN - icon_s
    draw.text((MARGIN, row_y), "Acesse", font=font(40), fill=palette.text, anchor="lm")
    acesse_w = text_width(draw, "Acesse", font(40))
    site_font = font(40, True)
    site = "imovue.com.br"
    draw.text((MARGIN + acesse_w + 16, row_y), site, font=site_font, fill=palette.accent, anchor="lm")
    cursor = MARGIN + acesse_w + 16 + text_width(draw, site, site_font) + 28
    if modalidade:
        draw.text((cursor, row_y), "|", font=font(40), fill=palette.muted, anchor="lm")
        cursor += text_width(draw, "|", font(40)) + 28
        avail = globe_x - 28 - cursor
        if avail < 200 and len(modalidade) > 20:
            modalidade = modalidade[:18].rstrip() + "…"
            avail = globe_x - 28 - cursor
        mod_font = fit_font(modalidade, max(avail, 60), 40)
        draw.text((cursor, row_y), modalidade, font=mod_font, fill=palette.subtext, anchor="lm")
    icon_globe(draw, globe_x, row_y - icon_s // 2, icon_s, palette.accent)


def generate_feed_card(imovel: dict, scope_uf: str, output: Path, theme: str = "premium") -> Path:
    palette = palette_for(theme)
    width, height = FEED_SIZE
    texts = offer_texts(imovel, scope_uf)
    image = load_background(FEED_SIZE, palette)
    draw = ImageDraw.Draw(image)
    zone = 640

    draw_brand(draw, MARGIN, 88, palette, 78)
    badge_bottom = draw_offer_badge(draw, MARGIN, 200, palette)
    if theme == "desconto-hero" and texts["desconto"]:
        cursor = draw_discount_hero(draw, MARGIN, badge_bottom + 40, texts, zone, palette)
        cursor = draw_location(draw, MARGIN, cursor + 8, texts, zone, palette, title_size=84)
        panel_bottom = draw_price_panel(image, MARGIN, cursor + 26, zone, texts, palette, show_badge=False)
    else:
        cursor = draw_location(draw, MARGIN, badge_bottom + 44, texts, zone, palette)
        panel_bottom = draw_price_panel(image, MARGIN, cursor + 30, zone, texts, palette)
    draw = ImageDraw.Draw(image)
    draw_property_facts(draw, MARGIN, panel_bottom + 32, texts["facts"], height - 132 - 24, palette)
    draw_footer(draw, width, height - 132, texts["modalidade"], palette)

    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, format="PNG", optimize=True)
    return output


def generate_story_card(imovel: dict, scope_uf: str, output: Path, theme: str = "premium") -> Path:
    palette = palette_for(theme)
    width, height = STORY_SIZE
    texts = offer_texts(imovel, scope_uf)
    image = load_background(STORY_SIZE, palette)
    # Véu lateral garante legibilidade; usa a cor de fundo do tema.
    base_rgb = Image.new("RGB", (1, 1), palette.bg_top).getpixel((0, 0))
    scrim = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    veil = ImageDraw.Draw(scrim)
    for x in range(int(width * 0.78)):
        alpha = int(150 * (1 - x / (width * 0.78)))
        veil.line([(x, 0), (x, height)], fill=(*base_rgb, alpha))
    image = Image.alpha_composite(image.convert("RGBA"), scrim).convert("RGB")
    draw = ImageDraw.Draw(image)

    draw_brand(draw, MARGIN, 120, palette, 78)
    badge_bottom = draw_offer_badge(draw, MARGIN, 232, palette)
    if theme == "desconto-hero" and texts["desconto"]:
        cursor = draw_discount_hero(draw, MARGIN, badge_bottom + 44, texts, width - MARGIN * 2, palette)
        cursor = draw_location(draw, MARGIN, cursor + 8, texts, width - MARGIN * 2, palette, title_size=84)
        panel_bottom = draw_price_panel(image, MARGIN, cursor + 32, width - MARGIN * 2, texts, palette, show_badge=False)
    else:
        cursor = draw_location(draw, MARGIN, badge_bottom + 48, texts, width - MARGIN * 2, palette)
        panel_bottom = draw_price_panel(image, MARGIN, cursor + 36, width - MARGIN * 2, texts, palette)
    draw = ImageDraw.Draw(image)
    draw_property_facts(draw, MARGIN, panel_bottom + 48, texts["facts"], height - 320 - 30, palette)
    draw_footer(draw, width, height - 320, texts["modalidade"], palette)

    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, format="PNG", optimize=True)
    return output


def generate_preview_cards(imovel: dict, scope_uf: str, output_dir: Path, prefix: str) -> list[Path]:
    """Renderiza um card feed por tema elegível (matriz de aprovação visual)."""
    from .templates import THEMES, eligible_themes

    wanted = [theme for theme in THEMES if theme in eligible_themes(imovel)] or ["premium"]
    paths = []
    for theme in wanted:
        paths.append(generate_feed_card(imovel, scope_uf, output_dir / f"{prefix}_preview_{theme}.png", theme))
    return paths


def generate_card(imovel: dict, uf: str, score: float, output: Path, theme: str = "premium") -> Path:
    """Compatibilidade com o publicador: gera a versão feed no tema dado."""
    return generate_feed_card(imovel, uf, output, theme)
