package api.apontamentos.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import api.apontamentos.entity.ChapaSubordinado;
import api.apontamentos.service.ChapaSubordinadoService;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/chapa-subordinado")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ChapaSubordinadoController {

    private final ChapaSubordinadoService service;

    @GetMapping("/{id}")
    public ResponseEntity<List<ChapaSubordinado>> pegarSubordinadoPorChapa(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarChapaPorSuperior(id));
    }

}
