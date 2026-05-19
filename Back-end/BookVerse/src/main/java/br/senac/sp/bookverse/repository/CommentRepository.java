package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.Comment;
import br.senac.sp.bookverse.model.CommentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByUsuarioId(Long usuarioId);
    Page<Comment> findByUsuarioId(Long usuarioId, Pageable pageable);
    List<Comment> findByDiscussaoId(Long discussaoId);
    Page<Comment> findByDiscussaoId(Long discussaoId, Pageable pageable);
    List<Comment> findByDiscussaoIdAndStatus(Long discussaoId, CommentStatus status);
    Page<Comment> findByDiscussaoIdAndStatus(Long discussaoId, CommentStatus status, Pageable pageable);
    List<Comment> findByStatus(CommentStatus status);
}

