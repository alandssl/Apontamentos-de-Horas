package api.apontamentos.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DataApontamentosDTO {
    private Long userId;
    private List<Long> ids;
}
