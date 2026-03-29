package br.com.imovue.admin.api;

import br.com.imovue.catalog.service.InMemoryStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);
    private static final Charset LATIN1 = Charset.forName("ISO-8859-1");

    private final InMemoryStore store;

    public AdminController(InMemoryStore store) {
        this.store = store;
    }

    @GetMapping("/arquivos")
    public List<Map<String, Object>> listarArquivos() {
        return store.ufsDisponiveis().stream()
                .map(uf -> descreverArquivo(uf, "Lista_imoveis_" + uf + ".csv"))
                .toList();
    }

    @PostMapping("/importar")
    public ResponseEntity<Map<String, Object>> importar(@RequestParam("arquivo") MultipartFile arquivo) throws IOException {
        if (arquivo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Arquivo vazio"));
        }
        String nome = arquivo.getOriginalFilename() != null ? arquivo.getOriginalFilename() : "upload.csv";
        log.info("Upload recebido: {}", nome);
        int count = store.importarCsv(arquivo.getInputStream(), nome);
        return ResponseEntity.ok(Map.of("status", "SUCESSO", "totalImportadas", count, "totalGeral", store.total()));
    }

    @PostMapping("/carregar-arquivo")
    public Map<String, Object> carregarArquivo(@RequestParam String nome) throws IOException {
        Path arquivo = store.resolverArquivo(nome);
        log.info("Carregando arquivo: {}", arquivo.getFileName());
        try (var is = Files.newInputStream(arquivo)) {
            int count = store.importarCsv(is, nome);
            return Map.of("status", "SUCESSO", "arquivo", nome, "totalImportadas", count, "totalGeral", store.total());
        }
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of("totalImoveis", store.total(), "uf", store.getUfAtual());
    }

    private Map<String, Object> descreverArquivo(String uf, String nome) {
        try {
            Path path = store.resolverArquivo(nome);
            long size = Files.size(path);
            long lines;
            try (Stream<String> stream = Files.lines(path, LATIN1)) {
                lines = stream.count();
            }
            return Map.of("nome", nome, "uf", uf, "tamanho", size, "linhas", lines,
                    "modificado", Files.getLastModifiedTime(path).toString());
        } catch (IOException e) {
            log.warn("Erro ao descrever arquivo {}: {}", nome, e.getMessage());
            return Map.of("nome", nome, "uf", uf, "erro", e.getMessage());
        }
    }
}
