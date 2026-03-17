package api.apontamentos.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UsuarioCreateDTO {

    private String nome;
    private String usuario;
    private String senha;
    private String chapa;
}
