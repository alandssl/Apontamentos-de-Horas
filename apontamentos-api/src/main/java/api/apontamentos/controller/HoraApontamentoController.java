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

import api.apontamentos.dto.HoraApontamentoDTO;
import api.apontamentos.entity.HoraApontamentos;
import api.apontamentos.service.HoraApontamentosService;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/horas")
@RequiredArgsConstructor
@CrossOrigin("*")
public class HoraApontamentoController {

    private final HoraApontamentosService service;

    @GetMapping
    public List<HoraApontamentos> listarAtivos(){
        return service.buscarTodosAtivos();
    }

    @PostMapping
    public ResponseEntity<HoraApontamentos> salvarHoras(@RequestBody HoraApontamentoDTO dto){
        HoraApontamentos salvo = service.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @DeleteMapping("/{id}")
    public void deletarHora(@PathVariable Long id){
        HoraApontamentos hora = service.buscarPorId(id);
        Long dataId = hora.getDataApontamentoId().getId();
        service.deletar(id);
        service.editarHoraApontamentos(dataId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HoraApontamentos> atualizarHora(@RequestBody HoraApontamentos horas, @PathVariable Long id){
        HoraApontamentos atualizado = service.atualizar(id, horas);

        return ResponseEntity.ok(atualizado);
    }

}
