package api.apontamentos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import api.apontamentos.entity.Usuarios;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuarios, Long> {

    Optional<Usuarios> findByUsuario(String usuario);

}
