package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.PerfilUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PerfilUsuarioRepository extends JpaRepository<PerfilUsuario, Long> {
    Optional<PerfilUsuario> findByUsuarioId(Long usuarioId);
}