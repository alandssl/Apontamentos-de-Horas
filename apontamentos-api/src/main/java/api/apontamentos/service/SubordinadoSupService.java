package api.apontamentos.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import api.apontamentos.entity.SubordinadoSup;
import api.apontamentos.repository.SubordinadoSupRepository;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class SubordinadoSupService {

    private final SubordinadoSupRepository repository;

    // public List<SubordinadoSup> buscarTodos(){
    //     return repository.findAll();
    // }

    public List<SubordinadoSup> buscarPeloId(Long id){
        return repository.findByIdAndDataExclusaoNull(id);
    }

    public SubordinadoSup salvar(SubordinadoSup subSup){
        return repository.save(subSup);
    }

    public void deletar(Long id){
        SubordinadoSup subSup = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Subordinado não encontrado com id: " + id));

        subSup.setDataExclusao(LocalDateTime.now());

        repository.save(subSup);
    }

    // public List<SubordinadoSup> buscarPorSuperiorId(Long superiorId) {
    //     return repository.findBySuperiorId_IdAndDataExclusaoNull(superiorId);
    // }
}
