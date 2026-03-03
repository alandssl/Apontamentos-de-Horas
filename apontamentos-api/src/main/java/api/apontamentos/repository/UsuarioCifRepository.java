package api.apontamentos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import api.apontamentos.entity.UsuarioCif;

@Repository
public interface UsuarioCifRepository extends JpaRepository<UsuarioCif, Long> {

    List<UsuarioCif> findByCifContainingIgnoreCase(String cif);

    List<UsuarioCif> findByAtivo(boolean ativo);

    @Query("SELECT u FROM UsuarioCif u WHERE u.usuarioId = :usuarioId")
    List<UsuarioCif> findByUsuarioId(Long usuarioId);

    List<UsuarioCif> findByUsuarioId_Id(Long id);

}
