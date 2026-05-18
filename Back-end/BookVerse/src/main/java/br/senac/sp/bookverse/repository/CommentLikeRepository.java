package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.CommentLike;
import br.senac.sp.bookverse.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    long countByCommentIdAndLikedTrue(Long commentId);

    Optional<CommentLike> findByCommentIdAndUsuario(Long commentId, User usuario);
}
