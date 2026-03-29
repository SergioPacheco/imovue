package br.com.imovue.catalog.api;

import br.com.imovue.catalog.domain.Imovel;
import br.com.imovue.catalog.service.InMemoryStore;
import br.com.imovue.catalog.service.InMemoryStore.FiltroImovel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CatalogoController {

    private final InMemoryStore store;

    public CatalogoController(InMemoryStore store) {
        this.store = store;
    }

    @GetMapping("/ufs")
    public List<String> ufsDisponiveis() {
        return store.ufsDisponiveis();
    }

    @PostMapping("/carregar")
    public Map<String, Object> carregar(@RequestParam String uf) {
        if (uf == null || uf.isBlank() || uf.length() > 2) {
            throw new IllegalArgumentException("UF inválida");
        }
        int total = store.carregar(uf);
        return Map.of("uf", uf.toUpperCase(), "total", total);
    }

    @GetMapping("/estado")
    public Map<String, Object> estadoAtual() {
        return Map.of("uf", store.getUfAtual(), "total", store.total());
    }

    @GetMapping("/imoveis")
    public InMemoryStore.PageResult listar(
            @RequestParam(required = false) String cidade,
            @RequestParam(required = false) String bairro,
            @RequestParam(required = false) String tipoImovel,
            @RequestParam(required = false) BigDecimal precoMin,
            @RequestParam(required = false) BigDecimal precoMax,
            @RequestParam(required = false) BigDecimal descontoMin,
            @RequestParam(required = false) String modalidade,
            @RequestParam(required = false) Integer quartosMin,
            @RequestParam(required = false) Integer vagasMin,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return store.listar(new FiltroImovel(cidade, bairro, tipoImovel, precoMin, precoMax,
                descontoMin, modalidade, quartosMin, vagasMin, sort, page, size));
    }

    @GetMapping("/imoveis/{numeroImovel}")
    public ResponseEntity<Imovel> detalhe(@PathVariable String numeroImovel) {
        return store.porNumero(numeroImovel)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/filtros/cidades")
    public List<String> cidades() { return store.cidades(); }

    @GetMapping("/filtros/tipos")
    public List<String> tipos() { return store.tipos(); }

    @GetMapping("/estatisticas")
    public Map<String, Object> estatisticas() { return store.estatisticas(); }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return store.dashboard();
    }
}
