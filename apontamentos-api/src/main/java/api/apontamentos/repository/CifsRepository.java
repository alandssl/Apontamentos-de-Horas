package api.apontamentos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import api.apontamentos.entity.Cifs;

@Repository
public interface CifsRepository extends JpaRepository<Cifs, String> {

    // @Query("SELECT c FROM corpore_gccusto c WHERE c.codccusto like ?1")
    // List<Cifs> findByCodccusto(String codccusto);

    // Busca todos os Cifs cujos códigos estejam na lista fornecida
    List<Cifs> findByCodccustoContaining(String codigos);
}
