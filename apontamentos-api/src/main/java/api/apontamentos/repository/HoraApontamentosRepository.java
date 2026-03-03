package api.apontamentos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import api.apontamentos.entity.DataApontamentos;
import api.apontamentos.entity.HoraApontamentos;

@Repository
public interface HoraApontamentosRepository extends JpaRepository<HoraApontamentos, Long> {

    List<HoraApontamentos> findByAtivo(Boolean ativo);
    boolean existsByDataApontamentoIdAndAtivoTrue(DataApontamentos data);

}
