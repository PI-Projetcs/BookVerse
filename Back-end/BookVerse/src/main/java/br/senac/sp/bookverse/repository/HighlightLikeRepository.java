package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.HighlightLike;
import br.senac.sp.bookverse.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HighlightLikeRepository extends JpaRepository<HighlightLike, Long> {
    long countByHighlightIdAndLikedTrue(Long highlightId);

    Optional<HighlightLike> findByHighlightIdAndUsuario(Long highlightId, User usuario);
}
