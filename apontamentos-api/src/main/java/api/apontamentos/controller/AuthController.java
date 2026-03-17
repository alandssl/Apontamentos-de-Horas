package api.apontamentos.controller;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import api.apontamentos.config.JwtService;
import api.apontamentos.dto.LoginRequestDTO;
import api.apontamentos.dto.LoginResponseDTO;
import api.apontamentos.entity.Usuarios;
import api.apontamentos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO dto) { 
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(dto.getUsuario(), dto.getSenha())
        );
        Usuarios usuario = usuarioRepository.findByUsuario(dto.getUsuario()).get();
        String token = jwtService.gerarToken(usuario);
        return new LoginResponseDTO(token, usuario.getUsuario());

    }
}
