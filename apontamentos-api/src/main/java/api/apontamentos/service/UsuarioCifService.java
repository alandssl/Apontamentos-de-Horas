package api.apontamentos.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import api.apontamentos.entity.UsuarioCif;
import api.apontamentos.repository.UsuarioCifRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UsuarioCifService {

    private final UsuarioCifRepository repository;

    public UsuarioCif salvar(UsuarioCif usuarioCif) {
        return repository.save(usuarioCif);
    }

    public void deletar(Long id) {
        UsuarioCif usuarioCif = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("UsuarioCif não encontrado com id: " + id));

        usuarioCif.setAtivo(false);
        usuarioCif.setDataExclusao(LocalDateTime.now());

        repository.save(usuarioCif);
    }

    public UsuarioCif atualizar(Long id, UsuarioCif usuarioCifAtualizado) {
        UsuarioCif usuarioCif = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("UsuarioCif não encontrado com id: " + id));

        usuarioCif.setUsuarioId(usuarioCifAtualizado.getUsuarioId());
        usuarioCif.setCif(usuarioCifAtualizado.getCif());

        return repository.save(usuarioCif);
    }

    public List<UsuarioCif> buscarPorCif(String cif) {
        return repository.findByCifContainingIgnoreCase(cif);
    }

    public List<UsuarioCif> ListarCifsAtivas() {
        return repository.findByAtivo(true);
    }

    public List<UsuarioCif> buscarPorUsuario(String usuarioId) {
        return repository.findByUsuarioId_Id(Long.valueOf(usuarioId));
    }

}
