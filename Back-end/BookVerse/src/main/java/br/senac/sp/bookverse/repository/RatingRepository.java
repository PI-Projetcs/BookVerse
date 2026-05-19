package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.Rating;
import br.senac.sp.bookverse.model.RatingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByUsuarioId(Long usuarioId);
    Page<Rating> findByUsuarioId(Long usuarioId, Pageable pageable);
    List<Rating> findByLivroId(Long livroId);
    Page<Rating> findByLivroId(Long livroId, Pageable pageable);
    Optional<Rating> findByLivroIdAndUsuarioId(Long livroId, Long usuarioId);
    List<Rating> findByStatus(RatingStatus status);
}

