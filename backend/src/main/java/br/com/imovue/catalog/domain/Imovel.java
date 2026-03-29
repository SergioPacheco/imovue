package br.com.imovue.catalog.domain;

import java.math.BigDecimal;

public record Imovel(
    String numeroImovel,
    String uf,
    String cidade,
    String bairro,
    String endereco,
    BigDecimal precoVenda,
    BigDecimal valorAvaliacao,
    BigDecimal percentualDesconto,
    String financiamento,
    String descricao,
    String modalidadeVenda,
    String urlOficial,
    // Campos extraídos da descrição
    String tipoImovel,
    BigDecimal areaTotal,
    BigDecimal areaPrivativa,
    BigDecimal areaTerreno,
    Integer quartos,
    Integer vagas
) {}
