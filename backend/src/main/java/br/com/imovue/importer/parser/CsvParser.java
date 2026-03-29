package br.com.imovue.importer.parser;

import br.com.imovue.catalog.domain.Imovel;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class CsvParser {

    private static final Logger log = LoggerFactory.getLogger(CsvParser.class);
    private static final Charset LATIN1 = Charset.forName("ISO-8859-1");

    // Índices de coluna
    private static final int COL_NUMERO = 0;
    private static final int COL_UF = 1;
    private static final int COL_CIDADE = 2;
    private static final int COL_BAIRRO = 3;
    private static final int COL_ENDERECO = 4;
    private static final int COL_PRECO = 5;
    private static final int COL_AVALIACAO = 6;
    private static final int COL_DESCONTO = 7;
    private static final int COL_FINANCIAMENTO = 8;
    private static final int MIN_COLUMNS = 3;

    // Padrões para extração da descrição
    private static final Pattern NUMERO_PATTERN = Pattern.compile("\\d+");
    private static final Pattern TIPO_PATTERN = Pattern.compile("^(\\w+),");
    private static final Pattern AREA_TOTAL_PATTERN = Pattern.compile("([\\d.]+) de área total");
    private static final Pattern AREA_PRIV_PATTERN = Pattern.compile("([\\d.]+) de área privativa");
    private static final Pattern AREA_TERRENO_PATTERN = Pattern.compile("([\\d.]+) de área do terreno");
    private static final Pattern QUARTOS_PATTERN = Pattern.compile("(\\d+) qto");
    private static final Pattern VAGAS_PATTERN = Pattern.compile("(\\d+) vaga");

    public record ParseResult(List<Imovel> imoveis, int rejeitadas) {}

    public ParseResult parse(InputStream input) throws IOException {
        try (var reader = new BufferedReader(new InputStreamReader(input, LATIN1))) {
            return doParse(reader);
        }
    }

    private ParseResult doParse(BufferedReader reader) throws IOException {
        String headerLine = findHeader(reader);
        boolean temFinanciamento = headerLine.contains("Financiamento");
        int offset = temFinanciamento ? 1 : 0;

        var format = CSVFormat.Builder.create()
                .setDelimiter(';').setIgnoreEmptyLines(true).setTrim(true).build();

        var imoveis = new ArrayList<Imovel>();
        int rejeitadas = 0;
        int linha = 0;

        for (CSVRecord r : format.parse(reader)) {
            linha++;
            try {
                if (r.size() < MIN_COLUMNS) continue;
                String numero = limpar(r.get(COL_NUMERO));
                if (!NUMERO_PATTERN.matcher(numero).matches()) continue;

                String financ = temFinanciamento ? limpar(r.get(COL_FINANCIAMENTO)) : null;
                String descricao = safeGet(r, COL_FINANCIAMENTO + offset);

                BigDecimal preco = parseMoeda(r.get(COL_PRECO));
                BigDecimal avaliacao = parseMoeda(r.get(COL_AVALIACAO));
                BigDecimal desconto = parsePercentual(r.get(COL_DESCONTO));

                if (desconto == null && avaliacao != null && preco != null
                        && avaliacao.compareTo(BigDecimal.ZERO) > 0) {
                    desconto = avaliacao.subtract(preco)
                            .multiply(BigDecimal.valueOf(100))
                            .divide(avaliacao, 2, RoundingMode.HALF_UP);
                }

                imoveis.add(new Imovel(
                        numero, limpar(r.get(COL_UF)), limpar(r.get(COL_CIDADE)),
                        limpar(r.get(COL_BAIRRO)), limpar(r.get(COL_ENDERECO)),
                        preco, avaliacao, desconto, financ, descricao,
                        safeGet(r, COL_FINANCIAMENTO + offset + 1),
                        safeGet(r, COL_FINANCIAMENTO + offset + 2),
                        extrairTipo(descricao),
                        extrairDecimal(AREA_TOTAL_PATTERN, descricao),
                        extrairDecimal(AREA_PRIV_PATTERN, descricao),
                        extrairDecimal(AREA_TERRENO_PATTERN, descricao),
                        extrairInt(QUARTOS_PATTERN, descricao),
                        extrairInt(VAGAS_PATTERN, descricao)
                ));
            } catch (ArrayIndexOutOfBoundsException | NumberFormatException e) {
                log.debug("Linha {} rejeitada: {}", linha, e.getMessage());
                rejeitadas++;
            }
        }

        log.info("Parse concluído: {} imóveis, {} rejeitadas", imoveis.size(), rejeitadas);
        return new ParseResult(imoveis, rejeitadas);
    }

    private String findHeader(BufferedReader reader) throws IOException {
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.contains("N°") || line.contains("N\u00b0")) return line;
        }
        throw new IOException("Cabeçalho CSV não encontrado");
    }

    private static String extrairTipo(String desc) {
        if (desc == null || desc.isBlank()) return null;
        Matcher m = TIPO_PATTERN.matcher(desc);
        return m.find() ? m.group(1) : null;
    }

    private static BigDecimal extrairDecimal(Pattern p, String desc) {
        if (desc == null) return null;
        Matcher m = p.matcher(desc);
        if (!m.find()) return null;
        try {
            BigDecimal v = new BigDecimal(m.group(1));
            return v.compareTo(BigDecimal.ZERO) > 0 ? v : null;
        } catch (NumberFormatException e) { return null; }
    }

    private static Integer extrairInt(Pattern p, String desc) {
        if (desc == null) return null;
        Matcher m = p.matcher(desc);
        return m.find() ? Integer.parseInt(m.group(1)) : null;
    }

    private static String safeGet(CSVRecord r, int i) {
        return r.size() > i ? limpar(r.get(i)) : "";
    }

    private static String limpar(String v) {
        return v == null ? "" : v.trim().replaceAll("\\s+", " ");
    }

    private static BigDecimal parseMoeda(String v) {
        if (v == null || v.isBlank()) return null;
        try { return new BigDecimal(v.trim().replace(".", "").replace(",", ".")); }
        catch (NumberFormatException e) { return null; }
    }

    private static BigDecimal parsePercentual(String v) {
        if (v == null || v.isBlank()) return null;
        try { return new BigDecimal(v.trim().replace("%", "").replace(",", ".")); }
        catch (NumberFormatException e) { return null; }
    }
}
