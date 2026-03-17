package api.apontamentos.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {

    private String token;
    private String tipo = "Bearer";
    private String usuario;

    public LoginResponseDTO(String token) {
        this.token = token;
    }

    public LoginResponseDTO(String token, String usuario) {
        this.token = token;
        this.usuario = usuario;
    }
}