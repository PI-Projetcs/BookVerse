package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.PerfilUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PerfilUsuarioRepository extends JpaRepository<PerfilUsuario, Long> {
    Optional<PerfilUsuario> findByUsuarioId(Long usuarioId);

    @Query("select count(livro) from PerfilUsuario perfil join perfil.livrosFavoritos livro where perfil.usuario.id = :usuarioId")
    long countFavoriteBooksByUsuarioId(@Param("usuarioId") Long usuarioId);
}