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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "hora_apontamentos")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class HoraApontamentos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "horas_efetivas")
    private String horasEfetivas;

    @ManyToOne
    @JoinColumn(name = "data_apontamento_id")
    private DataApontamentos dataApontamentoId;

    @Column
    private String detalhe;

    // ORÇAMENTO, TRABALHO DE ESCRITÓRIO, ETC
    @ManyToOne
    @JoinColumn(name = "tipo_id")
    private Tipo tipoId; 

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_alteracao")
    private LocalDateTime dataAlteracao;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuarios usuarioId;

    @Column
    private Boolean ativo;
    

    @PrePersist
    public void prePersist() {
        this.dataCriacao = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.dataAlteracao = LocalDateTime.now();
    }
}
