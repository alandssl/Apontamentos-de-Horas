package api.apontamentos.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import api.apontamentos.dto.HoraApontamentoDTO;
import api.apontamentos.entity.DataApontamentos;
import api.apontamentos.entity.HoraApontamentos;
import api.apontamentos.entity.Tipo;
import api.apontamentos.entity.Usuarios;
import api.apontamentos.repository.DataApontamentosRepository;
import api.apontamentos.repository.HoraApontamentosRepository;
import api.apontamentos.repository.TipoRepository;
import api.apontamentos.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HoraApontamentosService {

    private final HoraApontamentosRepository repository;
    private final DataApontamentosRepository dataRepository;
    private final UsuarioRepository usuarioRepository;
    private final TipoRepository tipoRepository;

    // Salva uma hora apontada e marca o ativo como verdadeiro
    @Transactional
    public HoraApontamentos salvar(HoraApontamentoDTO dto) {
        Usuarios usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        DataApontamentos dataExiste = dataRepository
                .findByDataAndChapaAndDataExclusaoIsNull(dto.getData(), dto.getChapa());

        DataApontamentos nova;
        if (dataExiste == null) {
            DataApontamentos novaData = new DataApontamentos();
            novaData.setData(dto.getData());
            novaData.setAtivo(true);
            novaData.setUsuarioId(usuario);
            novaData.setChapa(dto.getChapa());
            System.out.println("novaData: " + novaData.getId() + " chapa: " + novaData.getChapa() + " data: "
                    + novaData.getData());

            nova = dataRepository.save(novaData);
        } else if (dataExiste.getAprovadorId() != null && dataExiste.getDataAprovacao() != null) {
            throw new RuntimeException("Apontamento já aprovado, não é possível adicionar horas a essa data.");
        } else {
            nova = dataExiste;

        }

        Tipo tipo = tipoRepository.findById(dto.getTipoId())
                .orElseThrow(() -> new RuntimeException("Tipo não encontrado"));

        HoraApontamentos hora = new HoraApontamentos();
        hora.setHorasEfetivas(dto.getHorasEfetivas());
        hora.setDetalhe(dto.getDetalhe());
        hora.setUsuarioId(usuario);
        hora.setTipoId(tipo);
        hora.setDataApontamentoId(nova);
        hora.setAtivo(true);
        hora.setCif(dto.getCif());
        System.out.println("id: " + hora.getId() + " dataId: " + hora.getDataApontamentoId().getId() + " usuarioId: "
                + hora.getUsuarioId().getId() + " tipoId: "
                + hora.getTipoId().getId() + " horas: " + hora.getHorasEfetivas() +
                " detalhe: " + hora.getDetalhe() + " chapa: " + nova.getChapa() +
                " data: " + nova.getData());

        return repository.save(hora);
    }

    // Busca por todas as horas apontadas
    public List<HoraApontamentos> buscarTodosAtivos() {
        return repository.findByAtivo(true);
    }

    // Deleta pelo Id, não exclui do banco porem marca como falso e marca a data da
    // exclsão no banco
    public ResponseEntity<String> deletar(Long id) {
        HoraApontamentos horaApontamentos = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));

        if (horaApontamentos.getDataApontamentoId().getDataAprovacao() != null) {
            return new ResponseEntity<String>("Apontamento já aprovado, não é possível deletar.",
                    HttpStatus.BAD_REQUEST);
        }

        if (horaApontamentos.getDataApontamentoId().getDataRejeitada() != null) {
            return new ResponseEntity<String>("Apontamento já rejeitado, não é possível deletar.",
                    HttpStatus.BAD_REQUEST);
        }

        horaApontamentos.setAtivo(false);
        horaApontamentos.setDataExclusao(LocalDateTime.now());

        repository.save(horaApontamentos);
        return new ResponseEntity<String>("Apontamento deletado com sucesso.", HttpStatus.OK);
    }

    // Atualiza a hora apontada
    public HoraApontamentos atualizar(Long id, HoraApontamentoDTO horaApontamentosAtualizado) {
        HoraApontamentos horaApontamentos = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));

        DataApontamentos dataApontamento = horaApontamentos.getDataApontamentoId();

        Tipo tipo = tipoRepository.findById(horaApontamentosAtualizado.getTipoId())
                .orElseThrow(() -> new RuntimeException("Tipo não encontrado"));

        horaApontamentos.setHorasEfetivas(horaApontamentosAtualizado.getHorasEfetivas());
        horaApontamentos.setDetalhe(horaApontamentosAtualizado.getDetalhe());
        horaApontamentos.setTipoId(tipo);
        horaApontamentos.setCif(horaApontamentosAtualizado.getCif());
        if (dataApontamento.getDataRejeitada() != null) {
            dataApontamento.setAguardandoAjuste(false);
        }

        return repository.save(horaApontamentos);
    }

    // Verifica se contem horas apontadas naquela data, se não tiver a data é
    // apagada do banco.
    @Transactional
    public void editarHoraApontamentos(Long horaId) {
        HoraApontamentos hora = repository.findById(horaId)
                .orElseThrow(() -> new RuntimeException("Hora não encontrada"));

        DataApontamentos data = hora.getDataApontamentoId();

        boolean existeHoraAtiva = repository.existsByDataApontamentoIdAndAtivoTrue(data);
        System.out.println("existeHoraAtiva: " + existeHoraAtiva);
        if (!existeHoraAtiva) {
            data.setAtivo(false);
            data.setDataExclusao(LocalDateTime.now());
            dataRepository.save(data);
        }

        repository.delete(hora);
    }

    public HoraApontamentos buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));
    }

    public HoraApontamentos atualizarApontamentoRejeitado(Long id, HoraApontamentos horaApontamentosAtualizado) {
        HoraApontamentos horaApontamentos = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));
        DataApontamentos dataApontamento = horaApontamentos.getDataApontamentoId();
        if (dataApontamento.getDataRejeitada() != null) {
            dataApontamento.setDataRejeitada(null);
            horaApontamentos.setHorasEfetivas(horaApontamentosAtualizado.getHorasEfetivas());
            horaApontamentos.setCif(horaApontamentosAtualizado.getCif());
            horaApontamentos.setTipoId(horaApontamentosAtualizado.getTipoId());
        }
        return repository.save(horaApontamentos);
    }

}