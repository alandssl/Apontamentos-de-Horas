package api.apontamentos.service;

import java.util.List;
import java.util.Optional;
import api.apontamentos.entity.Tipo;
import api.apontamentos.repository.TipoRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TipoService {

    private final TipoRepository repository;

    public List<Tipo> buscarTodos() {
        return repository.findAll();
    }

    public Optional<Tipo> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Tipo salvar(Tipo tipo) {
        return repository.save(tipo);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    public Tipo atualizar(Tipo tipo) {
        return repository.save(tipo);
    }

}
