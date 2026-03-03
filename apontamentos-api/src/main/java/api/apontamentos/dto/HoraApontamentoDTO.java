package api.apontamentos.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HoraApontamentoDTO {

    private String horasEfetivas;
    private LocalDate data;
    private String detalhe;
    private Long tipoId;
    private Long usuarioId;
    private Boolean ativo;
    private String chapa;
}