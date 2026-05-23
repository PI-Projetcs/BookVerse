package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.ReadingHistory;
import br.senac.sp.bookverse.model.ReadingStatus;
import br.senac.sp.bookverse.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory, Long> {
    List<ReadingHistory> findByUsuarioId(Long usuarioId);
    Page<ReadingHistory> findByUsuarioId(Long usuarioId, Pageable pageable);
    java.util.Optional<ReadingHistory> findByUsuarioAndLivro(User usuario, br.senac.sp.bookverse.model.Book livro);
    List<ReadingHistory> findByLivroId(Long livroId);
    Page<ReadingHistory> findByLivroId(Long livroId, Pageable pageable);
    List<ReadingHistory> findByStatus(ReadingStatus status);
    Page<ReadingHistory> findByStatus(ReadingStatus status, Pageable pageable);

    @Query("select count(distinct rh.livro.id) from ReadingHistory rh where rh.usuario.id = :usuarioId and rh.status = br.senac.sp.bookverse.model.ReadingStatus.COMPLETE")
    long countDistinctCompletedBooksByUsuarioId(@Param("usuarioId") Long usuarioId);
}

