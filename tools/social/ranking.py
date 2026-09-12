from __future__ import annotations

from dataclasses import dataclass, asdict


@dataclass
class Ranking:
    total: float
    discount: float
    financing: float
    price_m2: float
    completeness: float
    image: float
    value_m2: float | None = None
    median_m2: float | None = None

    def as_dict(self) -> dict:
        return asdict(self)


def value_m2(imovel: dict) -> float | None:
    price = imovel.get("precoVenda")
    if not price or float(price) <= 0:
        return None
    area = imovel.get("areaPrivativa") or imovel.get("areaTerreno") or imovel.get("areaTotal")
    if not area or float(area) <= 0:
        return None
    return float(price) / float(area)


def completeness_score(imovel: dict) -> float:
    fields = [
        "numeroImovel", "cidade", "bairro", "endereco", "modalidadeVenda",
        "valorAvaliacao", "financiamento", "areaPrivativa", "areaTotal", "quartos",
    ]
    present = sum(1 for field in fields if imovel.get(field) not in (None, "", 0))
    return round(present / len(fields) * 10, 2)


def rank_property(imovel: dict, median_m2: float | None = None) -> Ranking:
    discount = float(imovel.get("percentualDesconto") or 0)
    discount_points = min(max(discount, 0), 100) * 0.60
    financing_points = 10.0 if str(imovel.get("financiamento", "")).strip().lower() == "sim" else 0.0

    current_m2 = value_m2(imovel)
    price_points = 0.0
    if current_m2 and median_m2 and median_m2 > 0 and current_m2 < median_m2:
        price_points = min(15.0, ((median_m2 - current_m2) / median_m2) * 15.0)

    # A V1 usa card próprio; não presume que uma foto externa está disponível.
    image_points = 5.0 if imovel.get("imageUrl") or imovel.get("imagem") else 0.0
    total = discount_points + financing_points + price_points + completeness_score(imovel) + image_points
    return Ranking(round(total, 2), round(discount_points, 2), financing_points, round(price_points, 2), completeness_score(imovel), image_points, current_m2, median_m2)

