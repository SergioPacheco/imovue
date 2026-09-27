from __future__ import annotations

from .config import UF_NAMES
from .utils import area, currency, display_name, hashtag, percent, property_url


def location_line(imovel: dict) -> tuple[str, str, str]:
    """Retorna (linha_localizacao, cidade_uf, tag_cidade). Nunca omite a UF."""
    city = display_name(imovel.get("cidade") or "Cidade não informada")
    uf = str(imovel.get("uf") or "").strip().upper()
    cidade_uf = f"{city}/{uf}" if uf else city
    bairro = display_name(imovel.get("bairro"))
    linha = f"{bairro} – {cidade_uf}" if bairro else cidade_uf
    return linha, cidade_uf, hashtag(city)


def state_tag(imovel: dict) -> str:
    uf = str(imovel.get("uf") or "").strip().upper()
    return hashtag(UF_NAMES.get(uf, "")) if uf else ""


def opening(imovel: dict, tipo: str, cidade_uf: str, slot_index: int) -> str:
    """Abertura rotativa por slot; 'alto desconto' só com desconto real."""
    try:
        discount = float(imovel.get("percentualDesconto") or 0)
    except (TypeError, ValueError):
        discount = 0.0
    options = [
        f"🏠 Oportunidade imobiliária em {cidade_uf}",
        f"🏡 Nova oportunidade disponível na Imovue",
        f"💰 {tipo} por {currency(imovel.get('precoVenda'))} em {cidade_uf}",
    ]
    if discount >= 40:
        options.insert(1, f"🔥 Imóvel com alto desconto em {cidade_uf}")
    return options[slot_index % len(options)]


def compose_post(imovel: dict, uf: str, score: float, slot_index: int = 0) -> str:
    tipo = display_name(imovel.get("tipoImovel") or "Imóvel")
    linha_local, cidade_uf, tag_cidade = location_line(imovel)
    details = [
        opening(imovel, tipo, cidade_uf, slot_index),
        "",
        f"🏠 {tipo} em {linha_local}",
        f"💰 Venda: {currency(imovel.get('precoVenda'))}",
        f"📊 Avaliação: {currency(imovel.get('valorAvaliacao'))}",
        f"🔥 Desconto: {percent(imovel.get('percentualDesconto'))}",
    ]
    property_area = imovel.get("areaPrivativa") or imovel.get("areaTotal") or imovel.get("areaTerreno")
    if property_area:
        details.append(f"📐 Área: {area(property_area)}")
    if imovel.get("quartos"):
        details.append(f"🛏️ Quartos: {number_without_decimal(imovel['quartos'])}")
    if imovel.get("modalidadeVenda"):
        details.append(f"💻 Modalidade: {display_name(imovel['modalidadeVenda'])}")

    url = property_url(imovel, uf)
    tags = ["#ImoveisCaixa", "#ImoveisComDesconto", "#OportunidadeImobiliaria", "#Imovue"]
    for extra in (tag_cidade, state_tag(imovel)):
        if extra and extra not in tags and len(tags) < 6:
            tags.append(extra)
    return "\n".join([
        *details,
        "",
        "Veja todos os detalhes:",
        url,
        "",
        "⚠️ Informações sujeitas a alteração. Consulte o edital e confirme as condições diretamente na CAIXA.",
        "",
        " ".join(tags),
    ])


def number_without_decimal(value: object) -> str:
    return str(int(float(value)))
