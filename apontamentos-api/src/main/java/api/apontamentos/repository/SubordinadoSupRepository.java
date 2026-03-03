package api.apontamentos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import api.apontamentos.entity.SubordinadoSup;

@Repository
public interface SubordinadoSupRepository extends JpaRepository<SubordinadoSup, Long> {

    List<SubordinadoSup> findByIdAndDataExclusaoNull(Long id);
}
