package br.com.imovue.catalog.service;

import br.com.imovue.catalog.domain.Imovel;
import br.com.imovue.importer.parser.CsvParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class InMemoryStore {

    private static final Logger log = LoggerFactory.getLogger(InMemoryStore.class);

    private static final String SORT_DESCONTO_DESC = "desconto,desc";
    private static final String SORT_PRECO_ASC = "preco,asc";
    private static final String SORT_PRECO_DESC = "preco,desc";

    private final CsvParser parser;
    private final String dataDir;

    private volatile List<Imovel> imoveis = List.of();
    private volatile String ufAtual;

    public InMemoryStore(CsvParser parser, @Value("${app.data-dir:data/listas}") String dataDir) {
        this.parser = parser;
        this.dataDir = dataDir;
    }

    /** Lista UFs com CSV disponível no diretório de dados. */
    public List<String> ufsDisponiveis() {
        Path dir = Paths.get(dataDir);
        if (!Files.isDirectory(dir)) return List.of();
        try (Stream<Path> files = Files.list(dir)) {
            return files.filter(p -> p.toString().endsWith(".csv"))
                    .map(p -> p.getFileName().toString().replace("Lista_imoveis_", "").replace(".csv", ""))
                    .sorted().toList();
        } catch (IOException e) {
            log.error("Erro ao listar CSVs em {}: {}", dir, e.getMessage());
            return List.of();
        }
    }

    /** Carrega um CSV por UF, substituindo os dados atuais atomicamente. */
    public int carregar(String uf) {
        Path arquivo = resolverArquivo("Lista_imoveis_" + uf.toUpperCase() + ".csv");
        try (InputStream is = Files.newInputStream(arquivo)) {
            CsvParser.ParseResult result = parser.parse(is);
            this.imoveis = List.copyOf(result.imoveis());
            this.ufAtual = uf.toUpperCase();
            log.info("Carregado [{}]: {} imóveis, {} rejeitadas", uf, result.imoveis().size(), result.rejeitadas());
            return result.imoveis().size();
        } catch (IOException e) {
            log.error("Erro ao carregar CSV de {}: {}", uf, e.getMessage());
            throw new IllegalArgumentException("Erro ao carregar CSV de " + uf);
        }
    }

    /** Importa CSV de um InputStream, adicionando aos dados existentes. */
    public int importarCsv(InputStream input, String nome) throws IOException {
        CsvParser.ParseResult result = parser.parse(input);
        List<Imovel> nova = new ArrayList<>(this.imoveis);
        nova.addAll(result.imoveis());
        this.imoveis = List.copyOf(nova);
        log.info("Importado [{}]: {} imóveis, {} rejeitadas. Total: {}", nome, result.imoveis().size(), result.rejeitadas(), this.imoveis.size());
        return result.imoveis().size();
    }

    /** Resolve e valida caminho de arquivo dentro do diretório de dados. */
    public Path resolverArquivo(String nome) {
        Path arquivo = Paths.get(dataDir).resolve(nome).normalize();
        if (!arquivo.startsWith(Paths.get(dataDir).normalize())) {
            throw new IllegalArgumentException("Nome de arquivo inválido");
        }
        if (!Files.exists(arquivo)) {
            throw new IllegalArgumentException("Arquivo não encontrado: " + nome);
        }
        return arquivo;
    }

    public String getUfAtual() { return ufAtual != null ? ufAtual : ""; }
    public int total() { return imoveis.size(); }

    // --- Consultas (thread-safe: imoveis é volatile + imutável) ---

    public PageResult listar(FiltroImovel f) {
        List<Imovel> filtered = imoveis.stream()
                .filter(i -> f.cidade() == null || i.cidade().equalsIgnoreCase(f.cidade()))
                .filter(i -> f.bairro() == null || (i.bairro() != null && i.bairro().toUpperCase().contains(f.bairro().toUpperCase())))
                .filter(i -> f.tipoImovel() == null || (i.tipoImovel() != null && i.tipoImovel().equalsIgnoreCase(f.tipoImovel())))
                .filter(i -> f.precoMin() == null || (i.precoVenda() != null && i.precoVenda().compareTo(f.precoMin()) >= 0))
                .filter(i -> f.precoMax() == null || (i.precoVenda() != null && i.precoVenda().compareTo(f.precoMax()) <= 0))
                .filter(i -> f.descontoMin() == null || (i.percentualDesconto() != null && i.percentualDesconto().compareTo(f.descontoMin()) >= 0))
                .filter(i -> f.modalidade() == null || (i.modalidadeVenda() != null && i.modalidadeVenda().toUpperCase().contains(f.modalidade().toUpperCase())))
                .filter(i -> f.quartosMin() == null || (i.quartos() != null && i.quartos() >= f.quartosMin()))
                .filter(i -> f.vagasMin() == null || (i.vagas() != null && i.vagas() >= f.vagasMin()))
                .collect(Collectors.toCollection(ArrayList::new));

        ordenar(filtered, f.sort());

        int total = filtered.size();
        int page = f.page() != null ? f.page() : 0;
        int size = f.size() != null ? f.size() : 20;
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);

        return new PageResult(filtered.subList(from, to), total, (total + size - 1) / size, page, size);
    }

    public Optional<Imovel> porNumero(String numero) {
        return imoveis.stream().filter(i -> i.numeroImovel().equals(numero)).findFirst();
    }

    public List<String> cidades() {
        return imoveis.stream().map(Imovel::cidade).distinct().sorted().toList();
    }

    public List<String> tipos() {
        return imoveis.stream().map(Imovel::tipoImovel).filter(t -> t != null && !t.isBlank()).distinct().sorted().toList();
    }

    public Map<String, Object> estatisticas() {
        List<Imovel> lista = imoveis;
        double descontoMedio = lista.stream()
                .filter(i -> i.percentualDesconto() != null)
                .mapToDouble(i -> i.percentualDesconto().doubleValue())
                .average().orElse(0);

        return Map.of("total", lista.size(), "uf", getUfAtual(),
                "descontoMedio", Math.round(descontoMedio * 100.0) / 100.0);
    }

    public Map<String, Object> dashboard() {
        List<Imovel> lista = imoveis;
        if (lista.isEmpty()) return Map.of("total", 0, "uf", getUfAtual());

        var comDesconto = lista.stream().filter(i -> i.percentualDesconto() != null).toList();
        double descontoMedio = comDesconto.stream().mapToDouble(i -> i.percentualDesconto().doubleValue()).average().orElse(0);
        double descontoMax = comDesconto.stream().mapToDouble(i -> i.percentualDesconto().doubleValue()).max().orElse(0);
        double precoMedio = lista.stream().filter(i -> i.precoVenda() != null).mapToDouble(i -> i.precoVenda().doubleValue()).average().orElse(0);

        var topDescontos = comDesconto.stream()
                .sorted(Comparator.comparing(Imovel::percentualDesconto, Comparator.reverseOrder()))
                .limit(10).toList();

        long faixa0 = comDesconto.stream().filter(i -> i.percentualDesconto().doubleValue() < 20).count();
        long faixa20 = comDesconto.stream().filter(i -> { double d = i.percentualDesconto().doubleValue(); return d >= 20 && d < 40; }).count();
        long faixa40 = comDesconto.stream().filter(i -> { double d = i.percentualDesconto().doubleValue(); return d >= 40 && d < 60; }).count();
        long faixa60 = comDesconto.stream().filter(i -> i.percentualDesconto().doubleValue() >= 60).count();

        var porTipo = lista.stream().filter(i -> i.tipoImovel() != null)
                .collect(Collectors.groupingBy(Imovel::tipoImovel)).entrySet().stream()
                .map(e -> {
                    double ad = e.getValue().stream().filter(i -> i.percentualDesconto() != null).mapToDouble(i -> i.percentualDesconto().doubleValue()).average().orElse(0);
                    double ap = e.getValue().stream().filter(i -> i.precoVenda() != null).mapToDouble(i -> i.precoVenda().doubleValue()).average().orElse(0);
                    return Map.<String, Object>of("tipo", e.getKey(), "quantidade", e.getValue().size(), "descontoMedio", Math.round(ad * 100.0) / 100.0, "precoMedio", Math.round(ap * 100.0) / 100.0);
                }).sorted(Comparator.comparingDouble((Map<String, Object> m) -> (double) m.get("descontoMedio")).reversed()).toList();

        var porCidade = lista.stream().filter(i -> i.percentualDesconto() != null)
                .collect(Collectors.groupingBy(Imovel::cidade)).entrySet().stream()
                .filter(e -> e.getValue().size() >= 3)
                .map(e -> {
                    double ad = e.getValue().stream().mapToDouble(i -> i.percentualDesconto().doubleValue()).average().orElse(0);
                    return Map.<String, Object>of("cidade", e.getKey(), "quantidade", e.getValue().size(), "descontoMedio", Math.round(ad * 100.0) / 100.0);
                }).sorted(Comparator.comparingDouble((Map<String, Object> m) -> (double) m.get("descontoMedio")).reversed()).limit(10).toList();

        return Map.ofEntries(Map.entry("uf", getUfAtual()), Map.entry("total", lista.size()),
                Map.entry("descontoMedio", Math.round(descontoMedio * 100.0) / 100.0), Map.entry("descontoMax", Math.round(descontoMax * 100.0) / 100.0),
                Map.entry("precoMedio", Math.round(precoMedio * 100.0) / 100.0), Map.entry("topDescontos", topDescontos),
                Map.entry("distribuicaoDesconto", Map.of("ate20", faixa0, "de20a40", faixa20, "de40a60", faixa40, "acima60", faixa60)),
                Map.entry("porTipo", porTipo), Map.entry("porCidade", porCidade));
    }

    private void ordenar(List<Imovel> list, String sort) {
        if (sort == null) sort = SORT_DESCONTO_DESC;
        switch (sort) {
            case SORT_DESCONTO_DESC -> list.sort(Comparator.comparing(Imovel::percentualDesconto, Comparator.nullsLast(Comparator.reverseOrder())));
            case SORT_PRECO_ASC -> list.sort(Comparator.comparing(Imovel::precoVenda, Comparator.nullsLast(Comparator.naturalOrder())));
            case SORT_PRECO_DESC -> list.sort(Comparator.comparing(Imovel::precoVenda, Comparator.nullsLast(Comparator.reverseOrder())));
            default -> { /* sem ordenação */ }
        }
    }

    // --- Records ---

    public record FiltroImovel(String cidade, String bairro, String tipoImovel,
                                BigDecimal precoMin, BigDecimal precoMax, BigDecimal descontoMin,
                                String modalidade, Integer quartosMin, Integer vagasMin,
                                String sort, Integer page, Integer size) {}

    public record PageResult(List<Imovel> content, int totalElements, int totalPages, int number, int size) {}
}
