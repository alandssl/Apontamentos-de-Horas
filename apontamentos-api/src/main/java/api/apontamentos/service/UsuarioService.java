package api.apontamentos.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import api.apontamentos.entity.Usuarios;
import api.apontamentos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repository;

    public Usuarios salvar(Usuarios usuario) {
        return repository.save(usuario);
    }

    public List<Usuarios> buscarTodos() {
        return repository.findAll();
    }

    public Optional<Usuarios> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Optional<Usuarios> buscarPorUsuario(String usuario) {
        return repository.findByUsuario(usuario);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
