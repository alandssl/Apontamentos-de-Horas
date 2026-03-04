package api.apontamentos.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import api.apontamentos.entity.SubordinadoSup;
import api.apontamentos.service.SubordinadoSupService;
import lombok.RequiredArgsConstructor;


@RestController
@CrossOrigin("*")
@RequiredArgsConstructor
@RequestMapping("/subsup")
public class SubordinadoSupController {

    private final SubordinadoSupService service;

    // @GetMapping
    // public List<SubordinadoSup> listarTodos(){
    //     return service.buscarTodos();
    // }

    // @GetMapping("/{id}")
    // public List<SubordinadoSup> listarPorId(@PathVariable Long id){
    //     return service.buscarPeloId(id);
    // }   

    @PostMapping
    public ResponseEntity<SubordinadoSup> salvarSubordinado(@RequestBody SubordinadoSup subsup){
        SubordinadoSup salvar = service.salvar(subsup);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvar);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id){
        service.deletar(id);
    }

}
