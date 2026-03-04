package api.apontamentos.entity;

import java.time.LocalDate;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Entity
@Immutable
@Table(name = "corpore_pfunc")
@Getter
@Setter
public class ChapaSubordinado {

    @Id
    private String chapa;
    private String nome;
    @Column(name = "CODSITUACAO")
    private String codSituacao;
    @Column(name = "DATADEMISSAO")
    private LocalDate dataDemissao;

}
