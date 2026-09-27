"""Cards de anúncio Imovue — identidade premium para feed e story.

Feed: 1080×1350 (4:5) · Story: 1080×1920 (9:16).
Paleta: marinho profundo + branco + âmbar (cores da marca).
Na arte aparecem apenas: tipo, cidade/UF, bairro, preço, avaliação
riscada, selo de desconto, CTA e marca. Todo o resto vai na legenda.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from .utils import currency, display_name

FEED_SIZE = (1080, 1350)
STORY_SIZE = (1080, 1920)

NAVY_DEEP = "#0A2040"
NAVY = "#1E3A5F"
AMBER = "#F59E0B"
ICE = "#F8FAFC"
MUTED = "#94A3B8"
STRIKE = "#64748B"
WHITE = "#FFFFFF"

MARGIN = 86
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")


def font(size: int, bold: bool = False, serif: bool = False):
    if serif:
        filename = "DejaVuSerif-Bold.ttf" if bold else "DejaVuSerif.ttf"
    else:
        filename = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    try:
        return ImageFont.truetype(str(FONT_DIR / filename), size)
    except OSError:
        return ImageFont.load_default()


def fit_font(text: str, max_width: int, initial: int, bold: bool = False, serif: bool = False, minimum: int = 28):
    size = initial
    probe = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    while size > minimum:
        selected = font(size, bold, serif)
        if probe.textlength(text, font=selected) <= max_width:
            return selected
        size -= 4
    return font(size, bold, serif)


def draw_tracked(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str,
                 selected: ImageFont.ImageFont, fill: str, tracking: int = 8) -> int:
    """Desenha com espaçamento entre letras; retorna a largura total."""
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=selected, fill=fill)
        x += draw.textlength(char, font=selected) + tracking
    return int(x - xy[0] - tracking)


def text_width(draw: ImageDraw.ImageDraw, text: str, selected: ImageFont.ImageFont) -> int:
    return int(draw.textlength(text, font=selected))


def background(size: tuple[int, int]) -> Image.Image:
    width, height = size
    base = Image.new("RGB", size, NAVY_DEEP)
    draw = ImageDraw.Draw(base)
    top = Image.new("RGB", (1, 1), NAVY_DEEP).getpixel((0, 0))
    bottom = Image.new("RGB", (1, 1), NAVY).getpixel((0, 0))
    for y in range(height):
        ratio = y / max(1, height - 1)
        color = tuple(int(a + (b - a) * ratio) for a, b in zip(top, bottom))
        draw.line([(0, y), (width, y)], fill=color)
    glow = Image.new("RGBA", size, (0, 0, 0, 0))
    overlay = ImageDraw.Draw(glow)
    overlay.ellipse((width * 0.35, -height * 0.25, width * 1.25, height * 0.35), fill=(255, 255, 255, 20))
    overlay.ellipse((-width * 0.35, height * 0.55, width * 0.35, height * 1.15), fill=(245, 158, 11, 16))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    return Image.alpha_composite(base.convert("RGBA"), glow).convert("RGB")


def draw_wordmark(draw: ImageDraw.ImageDraw, x: int, y: int, size: int = 62) -> None:
    selected = font(size, True)
    draw.text((x, y), "Imo", font=selected, fill=ICE)
    draw.text((x + draw.textlength("Imo", font=selected), y), "vue", font=selected, fill=AMBER)


def draw_pill(draw: ImageDraw.ImageDraw, cx_right: int, y_center: int, text: str,
              selected: ImageFont.ImageFont, fg: str, outline: str, pad_x: int = 26, pad_y: int = 12) -> None:
    width = text_width(draw, text, selected) + pad_x * 2
    height = (selected.size if hasattr(selected, "size") else 24) + pad_y * 2
    x1 = cx_right - width
    draw.rounded_rectangle((x1, y_center - height // 2, cx_right, y_center + height // 2),
                           radius=height // 2, outline=outline, width=3)
    draw.text((x1 + pad_x, y_center), text, font=selected, fill=fg, anchor="lm")


def offer_texts(imovel: dict, scope_uf: str) -> dict:
    tipo = (display_name(imovel.get("tipoImovel") or "Imóvel")).upper()
    cidade = display_name(imovel.get("cidade") or "Cidade não informada")
    imovel_uf = str(imovel.get("uf") or scope_uf or "").strip().upper()
    bairro = display_name(imovel.get("bairro"))
    try:
        discount = float(imovel.get("percentualDesconto") or 0)
    except (TypeError, ValueError):
        discount = 0.0
    modalidade = display_name(imovel.get("modalidadeVenda") or "")
    return {
        "tipo": tipo,
        "cidade_uf": f"{cidade} · {imovel_uf}" if imovel_uf else cidade,
        "bairro": bairro,
        "preco": currency(imovel.get("precoVenda")),
        "avaliacao": currency(imovel.get("valorAvaliacao")) if imovel.get("valorAvaliacao") else "",
        "desconto": f"\u2212{discount:.0f}%" if discount > 0 else "",
        "rodape": f"imovue.com.br · {modalidade}" if modalidade else "imovue.com.br",
    }


def paint_offer_card(image: Image.Image, top: int, texts: dict, max_width: int) -> int:
    draw = ImageDraw.Draw(image)
    x0 = MARGIN
    pad = 64
    # Mede a altura antes de pintar o fundo.
    y = pad
    if texts["desconto"]:
        y += 84 + 30
    price_font = fit_font(texts["preco"], max_width - pad * 2, 150, bold=True)
    y += price_font.size + 18
    if texts["avaliacao"]:
        y += 44 + 20
    bottom = top + y + pad - 20
    draw.rounded_rectangle((x0, top, x0 + max_width, bottom), radius=36, fill=WHITE)
    y = top + pad
    if texts["desconto"]:
        badge_font = font(44, True)
        badge_w = text_width(draw, texts["desconto"], badge_font) + 56
        badge_h = 84
        draw.rounded_rectangle((x0 + pad, y, x0 + pad + badge_w, y + badge_h), radius=24, fill=AMBER)
        draw.text((x0 + pad + 28, y + badge_h // 2), texts["desconto"], font=badge_font, fill=NAVY_DEEP, anchor="lm")
        y += badge_h + 30
    draw.text((x0 + pad, y), texts["preco"], font=price_font, fill=NAVY_DEEP)
    y += price_font.size + 18
    if texts["avaliacao"]:
        old_font = font(44)
        old_text = f"de {texts['avaliacao']}"
        draw.text((x0 + pad, y), old_text, font=old_font, fill=STRIKE)
        line_y = y + 30
        draw.line([(x0 + pad, line_y), (x0 + pad + text_width(draw, old_text, old_font), line_y)], fill=STRIKE, width=3)
    return bottom


def draw_cta(draw: ImageDraw.ImageDraw, y: int, max_width: int, label: str = "Ver detalhes \u2192") -> int:
    cta_font = font(48, True)
    height = 120
    draw.rounded_rectangle((MARGIN, y, MARGIN + max_width, y + height), radius=28, fill=AMBER)
    draw.text((MARGIN + max_width // 2, y + height // 2), label, font=cta_font, fill=NAVY_DEEP, anchor="mm")
    return y + height


def draw_header(draw: ImageDraw.ImageDraw, width: int, y: int) -> None:
    draw_wordmark(draw, MARGIN, y)
    pill_font = font(30)
    draw_pill(draw, width - MARGIN, y + 32, "OFERTA CAIXA", pill_font, AMBER, AMBER)


def draw_footer(draw: ImageDraw.ImageDraw, width: int, y: int, text: str) -> None:
    draw.text((width // 2, y), text, font=font(32), fill=MUTED, anchor="mm")


def generate_feed_card(imovel: dict, scope_uf: str, output: Path) -> Path:
    width, height = FEED_SIZE
    max_width = width - MARGIN * 2
    texts = offer_texts(imovel, scope_uf)
    image = background(FEED_SIZE)
    draw = ImageDraw.Draw(image)

    draw_header(draw, width, 96)
    draw_tracked(draw, (MARGIN, 268), texts["tipo"], font(38), AMBER, tracking=10)
    title_font = fit_font(texts["cidade_uf"], max_width, 92, bold=True, serif=True)
    draw.text((MARGIN, 322), texts["cidade_uf"], font=title_font, fill=ICE)
    cursor = 322 + title_font.size + 24
    if texts["bairro"]:
        draw.text((MARGIN, cursor), texts["bairro"], font=font(42), fill=MUTED)
        cursor += 42 + 44
    else:
        cursor += 20

    card_bottom = paint_offer_card(image, cursor, texts, max_width)
    draw = ImageDraw.Draw(image)
    cta_bottom = draw_cta(draw, card_bottom + 40, max_width)
    draw_footer(draw, width, height - 90, texts["rodape"])

    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, format="PNG", optimize=True)
    return output


def generate_story_card(imovel: dict, scope_uf: str, output: Path) -> Path:
    width, height = STORY_SIZE
    max_width = width - MARGIN * 2
    texts = offer_texts(imovel, scope_uf)
    image = background(STORY_SIZE)
    draw = ImageDraw.Draw(image)

    draw_header(draw, width, 120)
    draw_tracked(draw, (MARGIN, 350), "OPORTUNIDADE DO DIA", font(36), AMBER, tracking=10)

    card_bottom = paint_offer_card(image, 500, texts, max_width)
    draw = ImageDraw.Draw(image)
    cursor = card_bottom + 56
    draw_tracked(draw, (MARGIN, cursor), texts["tipo"], font(38), AMBER, tracking=10)
    cursor += 38 + 26
    title_font = fit_font(texts["cidade_uf"], max_width, 88, bold=True, serif=True)
    draw.text((MARGIN, cursor), texts["cidade_uf"], font=title_font, fill=ICE)
    cursor += title_font.size + 20
    if texts["bairro"]:
        draw.text((MARGIN, cursor), texts["bairro"], font=font(42), fill=MUTED)
        cursor += 42 + 48
    cta_bottom = draw_cta(draw, cursor, max_width, "Saiba mais \u2192")
    draw_footer(draw, width, min(cta_bottom + 90, height - 280), texts["rodape"])

    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, format="PNG", optimize=True)
    return output


def generate_card(imovel: dict, uf: str, score: float, output: Path) -> Path:
    """Compatibilidade com o publicador: gera a versão feed."""
    return generate_feed_card(imovel, uf, output)
