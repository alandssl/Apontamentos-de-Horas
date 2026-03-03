package api.apontamentos.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
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

import api.apontamentos.entity.UsuarioCif;
import api.apontamentos.service.UsuarioCifService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/usuario-cif")
@CrossOrigin("*")
public class UsuarioCifController {

    private final UsuarioCifService service;

    @PostMapping
    public ResponseEntity<UsuarioCif> criar(@RequestBody UsuarioCif usuCif) {
        UsuarioCif salvo = service.salvar(usuCif);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioCif> atualizar(@PathVariable Long id, @RequestBody UsuarioCif usuCif) {
        UsuarioCif atualizado = service.atualizar(id, usuCif);

        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioCif>> listarCifs() {
        return ResponseEntity.ok(service.ListarCifsAtivas());
    }

    // @GetMapping("/cif")
    // public ResponseEntity<List<UsuarioCif>> buscarPorCif(@RequestParam String
    // cif){
    // return ResponseEntity.ok(service.buscarPorCif(cif));
    // }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<List<UsuarioCif>> buscarPorUsuario(@PathVariable String usuarioId) {
        return ResponseEntity.ok(service.buscarPorUsuario(usuarioId));
    }

}
