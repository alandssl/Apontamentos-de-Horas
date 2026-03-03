package api.apontamentos.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import api.apontamentos.entity.Usuarios;
import api.apontamentos.service.UsuarioService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
@CrossOrigin("*")
public class UsuariosController {

    private final UsuarioService service;

    @GetMapping
    public List<Usuarios> Todos() {
        return service.buscarTodos();
    }

    @GetMapping("/{usuario}")
    public ResponseEntity<Usuarios> buscarPeloUsuario(@PathVariable String usuario) {
        return service.buscarPorUsuario(usuario)
                .map(ResponseEntity::ok) //
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Usuarios> buscarPeloId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok) //
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/salvar")
    public Usuarios criar(@RequestBody Usuarios usuarios) {
        return service.salvar(usuarios);
    }

    @DeleteMapping("/{id}")
    public void deletarUsuario(@PathVariable Long id) {
        service.deletar(id);
    }

}
