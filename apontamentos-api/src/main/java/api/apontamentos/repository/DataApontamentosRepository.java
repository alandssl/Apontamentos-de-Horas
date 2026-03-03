package api.apontamentos.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import api.apontamentos.entity.DataApontamentos;

@Repository
public interface DataApontamentosRepository extends JpaRepository<DataApontamentos, Long> {

    List<DataApontamentos> findByAtivo(Boolean ativo);

    Optional<DataApontamentos> findByDataAndChapaAndDataExclusaoIsNull(LocalDate data, String chapa);

    DataApontamentos findByDataAprovacaoIsNull(LocalDateTime dataAprovacao);

    DataApontamentos findByDataRejeitadaIsNull(LocalDateTime dataRejeitada);

}
