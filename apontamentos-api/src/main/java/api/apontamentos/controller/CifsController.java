package api.apontamentos.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import api.apontamentos.entity.Cifs;
import api.apontamentos.entity.UsuarioCif;
import api.apontamentos.service.CifsService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cif")
@CrossOrigin("*")
public class CifsController {

    private final CifsService service;

    @GetMapping("/todos")
    public List<Cifs> findAll() {
        return service.findAllCifs();
    }

    @PostMapping("/salvar")
    public Cifs salvarCif(@RequestBody Cifs cif) {
        return service.salvarCif(cif);
    }

    @DeleteMapping("/{codccusto}")
    public void deletarCif(@PathVariable String codccusto) {
        service.deletarCif(codccusto);
    }

    @GetMapping("/usuario/{id}")
    public List<Cifs> findByUsuarioId(@PathVariable Long id) {
        return service.findByUsuarioId(id);
    }

    @GetMapping("/{id}")
    public List<UsuarioCif> encontrarPorUsuario(@PathVariable Long id) {
        return service.achaUsuarioCifs(id);
    }
}
