from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .config import ROOT_DIR, UF_NAMES
from .utils import area, currency, display_name, percent

WIDTH, HEIGHT = 1200, 630
NAVY = "#082653"
BLUE = "#1268df"
YELLOW = "#ffd21c"
LIGHT_BLUE = "#eef6ff"
FONT_DIR = Path("/usr/share/fonts/truetype/dejavu")


def font(size: int, bold: bool = False):
    filename = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    path = FONT_DIR / filename
    try:
        return ImageFont.truetype(str(path), size)
    except OSError:
        return ImageFont.load_default()


def fit_text(draw: ImageDraw.ImageDraw, text: str, max_width: int, initial_size: int, bold: bool = False):
    size = initial_size
    while size > 18:
        selected = font(size, bold)
        if draw.textbbox((0, 0), text, font=selected)[2] <= max_width:
            return selected
        size -= 2
    return font(size, bold)


def generate_card(imovel: dict, uf: str, score: float, output: Path) -> Path:
    image = Image.new("RGB", (WIDTH, HEIGHT), LIGHT_BLUE)
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 0, WIDTH, 18), fill=YELLOW)
    draw.rectangle((0, HEIGHT - 18, WIDTH, HEIGHT), fill=BLUE)
    draw.ellipse((850, -240, 1390, 300), fill="#d7ebff")
    draw.ellipse((-210, 480, 250, 940), fill="#fff3a8")

    logo_path = ROOT_DIR / "frontend" / "public" / "og-logo.png"
    if logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        logo.thumbnail((250, 95), Image.Resampling.LANCZOS)
        image.paste(logo, (55, 48), logo)
    else:
        draw.text((55, 55), "Imovue", fill=BLUE, font=font(42, True))

    state = UF_NAMES.get(uf.upper(), uf.upper())
    draw.rounded_rectangle((900, 50, 1145, 108), radius=24, fill=BLUE)
    draw.text((1020, 79), f"IMOVUE {uf.upper()}", fill="white", font=font(22, True), anchor="mm")

    tipo = display_name(imovel.get("tipoImovel") or "Imóvel").upper()
    cidade = display_name(imovel.get("cidade") or "Cidade não informada")
    draw.text((60, 190), tipo, fill=NAVY, font=fit_text(draw, tipo, 720, 54, True))
    draw.text((60, 260), cidade, fill=BLUE, font=fit_text(draw, cidade, 720, 50, True))
    draw.text((60, 325), state, fill=NAVY, font=font(28))

    draw.rounded_rectangle((60, 405, 515, 545), radius=22, fill="white", outline="#d3e2f4", width=2)
    draw.text((88, 428), "PREÇO DE VENDA", fill="#64748b", font=font(18, True))
    draw.text((88, 460), currency(imovel.get("precoVenda")), fill=NAVY, font=fit_text(draw, currency(imovel.get("precoVenda")), 400, 45, True))

    draw.rounded_rectangle((570, 405, 1140, 545), radius=22, fill=YELLOW)
    discount = percent(imovel.get("percentualDesconto"))
    draw.text((605, 425), discount + " DE DESCONTO", fill=NAVY, font=fit_text(draw, discount + " DE DESCONTO", 500, 42, True))
    evaluation = currency(imovel.get("valorAvaliacao"))
    financing = display_name(imovel.get("financiamento") or "Não informado")
    draw.text((605, 485), f"Avaliação: {evaluation}  •  Financiamento: {financing}", fill=NAVY, font=font(19))

    details = []
    property_area = imovel.get("areaPrivativa") or imovel.get("areaTotal") or imovel.get("areaTerreno")
    if property_area:
        details.append(area(property_area))
    if imovel.get("quartos"):
        details.append(f"{int(float(imovel['quartos']))} quarto(s)")
    if details:
        draw.text((60, 570), "  •  ".join(details), fill="white", font=font(20, True))
    draw.text((1138, 575), "imovue.com.br", fill="white", font=font(20, True), anchor="ra")

    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, format="PNG", optimize=True)
    return output

