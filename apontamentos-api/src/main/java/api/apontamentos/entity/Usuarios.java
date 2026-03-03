package api.apontamentos.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Usuarios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String usuario;

    @Column
    private String senha;

    @Column(name="data_criacao")
    private LocalDate dataCriacao; 

    @Column(name="data_atualizacao")
    private LocalDate dataAtualizacao;

    @Column
    private String nome;

    @Column
    private String chapa;

    @Column
    private Boolean aprovador;

    @Column 
    private Boolean relatorio;
    
    @PrePersist
    public void prePersist() {
        this.dataCriacao = LocalDate.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDate.now();
    }


}
