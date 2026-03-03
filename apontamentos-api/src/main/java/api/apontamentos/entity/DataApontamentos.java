package api.apontamentos.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "data_apontamentos")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DataApontamentos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private LocalDate data;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuarios usuarioId;

    @Column
    private String chapa;

    @Column(name="data_exclusao")
    private LocalDateTime dataExclusao;

    @Column(name="data_aprovacao")
    private LocalDateTime dataAprovacao;

    @ManyToOne
    @JoinColumn(name = "aprovador_id")
    private Usuarios aprovadorId;

    @Column
    private Boolean ativo;

    @Column(name = "data_rejeitada")
    private LocalDateTime dataRejeitada;

    
}
