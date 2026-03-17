package api.apontamentos.entity;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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
public class Usuarios implements UserDetails{

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

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return usuario;
    }

    @Override public boolean isAccountNonExpired() { return true; }

    @Override public boolean isAccountNonLocked() { return true; }

    @Override public boolean isCredentialsNonExpired() { return true; }
    
    @Override public boolean isEnabled() { return true; }
}
