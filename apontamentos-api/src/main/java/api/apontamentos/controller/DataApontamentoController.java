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

import api.apontamentos.entity.DataApontamentos;
import api.apontamentos.service.DataApontamentosService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/data")
@RequiredArgsConstructor
@CrossOrigin("*")
public class DataApontamentoController {

    private final DataApontamentosService service;

    @GetMapping
    public List<DataApontamentos> listarDatas(){
        return service.buscarTodosAtivos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DataApontamentos> buscarDataId(@PathVariable Long id){
        return service.buscarPorId(id).
        map(ResponseEntity::ok).
        orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DataApontamentos> salvarData(@RequestBody DataApontamentos data){
        DataApontamentos salva = service.salvar(data);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DataApontamentos> atualizarData(@RequestBody DataApontamentos data, @PathVariable Long id){
        DataApontamentos atualizado = service.atualizar(id, data);

        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}")
    public void deletarData(@PathVariable Long id){
        service.excluir(id);
    }

    @PutMapping("/{id}/aprovar")
    public ResponseEntity<DataApontamentos> aprovarData(@PathVariable Long id) {
        DataApontamentos aprovada = service.aprovar(id);
        return ResponseEntity.ok(aprovada);
    }

    @PutMapping("/{id}/rejeitar")
    public ResponseEntity<DataApontamentos> rejeitarData(@PathVariable Long id) {
        DataApontamentos rejeitada = service.rejeitar(id);
        return ResponseEntity.ok(rejeitada);
    }

    // @PutMapping("/{id}/aprovar-dia")
    // public ResponseEntity<DataApontamentos> aprovarDia(@PathVariable Long id) {
    //     DataApontamentos dataId = service.buscarPorId(id)
    //             .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));
    //     service.aprovarPorDia(dataId);
    //     return ResponseEntity.ok(dataId);
    // }

    // @PutMapping("/{id}/aprovar-chapa")

    

}
