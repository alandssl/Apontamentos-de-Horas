package api.apontamentos.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuario_cif")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UsuarioCif {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuarios usuarioId;

    @Column
    private String cif;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;

    @Column
    private Boolean ativo;

    @PrePersist
    public void prePersist() {
        this.dataCriacao = LocalDateTime.now();    
    }
}
