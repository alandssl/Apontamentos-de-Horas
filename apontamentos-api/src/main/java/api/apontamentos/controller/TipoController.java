package api.apontamentos.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import api.apontamentos.entity.Tipo;
import api.apontamentos.repository.TipoRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tipos")
@RequiredArgsConstructor
@CrossOrigin("*")
public class TipoController {

    private final TipoRepository repository;

    @GetMapping
    public List<Tipo> listarTipos() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tipo> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Tipo> salvar(@RequestBody Tipo tipo) {
        return ResponseEntity.ok(repository.save(tipo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tipo> atualizar(@PathVariable Long id, @RequestBody Tipo tipo) {
        return repository.findById(id)
                .map(t -> {
                    t.setTipo(tipo.getTipo());
                    return repository.save(t);
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
