package api.apontamentos.entity;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "corpore_gccusto")
@Getter
@Setter
public class Cifs {

    @Id
    private String codccusto;
    // @Id
    private String codcoligada;
    private String nome;
    private String ativo;
    private String tipocif;
}
