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
@Table(name = "subordinado_sup")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class SubordinadoSup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "superior_id")
    private Usuarios superiorId;

    @Column(name = "subordinado_chapa")
    private String subordinadoChapa;

    @Column(name="data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name="data_exclusao")
    private LocalDateTime dataExclusao;

    @PrePersist
    public void prePersist(){
        this.dataCriacao = LocalDateTime.now();
    }
}
