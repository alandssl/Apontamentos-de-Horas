package api.apontamentos.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

        Optional<DataApontamentos> dataExiste = dataRepository
                .findByDataAndChapaAndDataExclusaoIsNull(dto.getData(), dto.getChapa());

        DataApontamentos data = dataExiste.orElseGet(() -> {

            DataApontamentos nova = new DataApontamentos();
            nova.setData(dto.getData());
            nova.setAtivo(true);
            nova.setUsuarioId(usuario);
            nova.setChapa(dto.getChapa());

            return dataRepository.save(nova);
        });

        Tipo tipo = tipoRepository.findById(dto.getTipoId())
                .orElseThrow(() -> new RuntimeException("Tipo não encontrado"));

        HoraApontamentos hora = new HoraApontamentos();
        hora.setHorasEfetivas(dto.getHorasEfetivas());
        hora.setDetalhe(dto.getDetalhe());
        hora.setUsuarioId(usuario);
        hora.setTipoId(tipo);
        hora.setDataApontamentoId(data);
        hora.setAtivo(true);

        return repository.save(hora);
    }

    // Busca por todas as horas apontadas
    public List<HoraApontamentos> buscarTodosAtivos() {
        return repository.findByAtivo(true);
    }

    // Deleta pelo Id, não exclui do banco porem marca como falso e marca a data da
    // exclsão no banco
    public void deletar(Long id) {
        HoraApontamentos horaApontamentos = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));

        horaApontamentos.setAtivo(false);
        horaApontamentos.setDataExclusao(LocalDateTime.now());

        repository.save(horaApontamentos);
    }

    // Atualiza a hora apontada
    public HoraApontamentos atualizar(Long id, HoraApontamentos horaApontamentosAtualizado) {
        HoraApontamentos horaApontamentos = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));

        horaApontamentos.setHorasEfetivas(horaApontamentosAtualizado.getHorasEfetivas());
        horaApontamentos.setDetalhe(horaApontamentosAtualizado.getDetalhe());
        horaApontamentos.setTipoId(horaApontamentosAtualizado.getTipoId());

        return repository.save(horaApontamentos);
    }

    // Verifica se contem horas apontadas naquela data, se não tiver a data é
    // apagada do banco.
    @Transactional
    public void editarHoraApontamentos(Long horaId) {
        HoraApontamentos hora = repository.findById(horaId)
        .orElseThrow(() -> new RuntimeException("Hora não encontrada"));

        DataApontamentos data = hora.getDataApontamentoId();

        repository.delete(hora);

        boolean existeHoraAtiva =repository.existsByDataApontamentoIdAndAtivoTrue(data);

        if (!existeHoraAtiva) {
            dataRepository.delete(data);
        }
    }

    public HoraApontamentos buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apontamento não encontrado com id: " + id));
    }

}