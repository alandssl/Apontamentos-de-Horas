package api.apontamentos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import api.apontamentos.entity.ChapaSubordinado;




@Repository
public interface ChapaSubordinadoRepository extends JpaRepository<ChapaSubordinado, String> {

    public List<ChapaSubordinado> findByChapaIn(List<String> chapa);

}
