package api.apontamentos.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import api.apontamentos.repository.UsuarioRepository;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository repository;

    @Override
    public UserDetails loadUserByUsername (String usuario) {
        return repository.findByUsuario(usuario)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

}
