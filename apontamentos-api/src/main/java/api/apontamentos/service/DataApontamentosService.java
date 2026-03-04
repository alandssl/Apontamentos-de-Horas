package api.apontamentos.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import api.apontamentos.entity.DataApontamentos;
import api.apontamentos.repository.DataApontamentosRepository;
import api.apontamentos.repository.HoraApontamentosRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DataApontamentosService {

    private final DataApontamentosRepository repository;
    private final HoraApontamentosRepository horaRepository;

    // Salva um novo apontamento, definindo o campo "ativo" como true
    public DataApontamentos salvar(DataApontamentos dataApontamentos) {
        dataApontamentos.setAtivo(true);
        return repository.save(dataApontamentos);
    }

    public Optional<DataApontamentos> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // Busca apenas os apontamentos que estão ativos
    public List<DataApontamentos> buscarTodosAtivos(){
        return repository.findByAtivo(true);
    }


    // Atualiza um apontamento existente, mantendo o campo "ativo" inalterado
    public DataApontamentos atualizar(Long id, DataApontamentos dataAapontamentosAtualizado){
        DataApontamentos dataApontamentos = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));

        dataApontamentos.setData(dataAapontamentosAtualizado.getData());
        dataApontamentos.setChapa(dataAapontamentosAtualizado.getChapa());
        dataApontamentos.setDataAprovacao(dataAapontamentosAtualizado.getDataAprovacao());

        return repository.save(dataApontamentos);
    }

    // Exclui um apontamento, definindo o campo "ativo" como false e registrando a data de exclusão
    public void excluir(Long id) {
        DataApontamentos dataApontamentos = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));

        dataApontamentos.setAtivo(false);
        dataApontamentos.setDataExclusao(LocalDateTime.now());

        repository.save(dataApontamentos);
    }

    public DataApontamentos aprovar(Long id) {
        DataApontamentos dataAprovada = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));
        if (dataAprovada.getDataAprovacao() == null) {
            dataAprovada.setDataAprovacao(LocalDateTime.now());
            dataAprovada.setAprovadorId(dataAprovada.getUsuarioId());
        }
        return repository.save(dataAprovada);
    }

    public DataApontamentos rejeitar(Long id) {
        DataApontamentos dataRejeitada = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));
        if (dataRejeitada.getDataRejeitada() == null) {
            dataRejeitada.setDataRejeitada(LocalDateTime.now());
        }
        return repository.save(dataRejeitada);
    }

    // public void aprovarPorDia(DataApontamentos data) {
    //     List<HoraApontamentos> horas = horaRepository.findByDataApontamentoIdAndAtivoTrue(data);
    //     if (!repository.findByDataAprovacaoIsNullAndDataRejeitadaIsNullAndChapa(data.getDataAprovacao(), 
    //     data.getDataRejeitada(), data.getChapa()).isEmpty()) {
    //         for (HoraApontamentos hora : horas) {
    //             Long id = hora.getId();
    //             DataApontamentos dataAprovada = repository.findById(id)
    //             .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));
    //             dataAprovada.setDataAprovacao(LocalDateTime.now());
    //             dataAprovada.setAprovadorId(dataAprovada.getUsuarioId());
    //             dataAprovada.setChapa(data.getChapa());
    //             repository.save(dataAprovada);
    //         }
    //     }
    // }

    public DataApontamentos buscarPorDataEChapa(Long id) {
        DataApontamentos dataApontamentos = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));
        if (dataApontamentos.getDataAprovacao() == null){
            DataApontamentos data = repository.findByChapaAndDataRejeitadaIsNullAndDataAprovacaoIsNullAndData(dataApontamentos.getData(), dataApontamentos.getChapa());
            data.setDataAprovacao(LocalDateTime.now());
            return repository.save(data);
        } else {
            throw new RuntimeException("Apontamento já aprovado, não é possível buscar por data e chapa.");
        }
    }

    public List<DataApontamentos> buscarPorDataEntre(LocalDate dataInicio, LocalDate dataFim, String chapa) {
        return repository.findByDataBetweenAndChapaAndDataExclusaoIsNullAndDataAprovacaoIsNull(dataInicio, dataFim, chapa);
    }


}
