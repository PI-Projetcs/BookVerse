package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.Discussion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscussionRepository extends JpaRepository<Discussion, Long> {
    List<Discussion> findByLivroId(Long livroId);
    Page<Discussion> findByLivroId(Long livroId, Pageable pageable);
}

