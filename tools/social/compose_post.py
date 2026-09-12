from __future__ import annotations

from .config import UF_NAMES
from .utils import area, currency, display_name, percent, property_url


def compose_post(imovel: dict, uf: str, score: float) -> str:
    state = UF_NAMES.get(uf.upper(), uf.upper())
    tipo = display_name(imovel.get("tipoImovel") or "Imóvel")
    city = display_name(imovel.get("cidade") or "Cidade não informada")
    bairro = display_name(imovel.get("bairro"))
    details = [f"🏠 {tipo} em {city}" + (f" — {bairro}" if bairro else "")]
    details.extend([
        f"💰 Venda: {currency(imovel.get('precoVenda'))}",
        f"📊 Avaliação: {currency(imovel.get('valorAvaliacao'))}",
        f"🔥 Desconto: {percent(imovel.get('percentualDesconto'))}",
    ])
    if imovel.get("financiamento"):
        details.append(f"🏦 Financiamento: {display_name(imovel['financiamento'])}")
    if imovel.get("quartos"):
        details.append(f"🛏 {number_without_decimal(imovel['quartos'])} quarto(s)")
    property_area = imovel.get("areaPrivativa") or imovel.get("areaTotal") or imovel.get("areaTerreno")
    if property_area:
        details.append(f"📐 Área: {area(property_area)}")
    if imovel.get("modalidadeVenda"):
        details.append(f"📋 Modalidade: {display_name(imovel['modalidadeVenda'])}")

    url = property_url(imovel, uf)
    hashtags = " ".join(f"#{name.replace(' ', '')}" for name in ["ImoveisCaixa", uf.upper(), "ImoveisComDesconto"])
    return "\n".join([
        f"🏠 Oportunidade do dia em {state}",
        "",
        *details,
        "",
        "Veja os detalhes, condições e a fonte oficial:",
        url,
        "",
        "⚠️ Informações sujeitas a alteração. Consulte o edital e confirme as condições diretamente na CAIXA.",
        "",
        f"{hashtags} #Imovue",
    ])


def number_without_decimal(value: object) -> str:
    return str(int(float(value)))

