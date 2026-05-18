package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.ChapterProgress;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChapterProgressRepository extends JpaRepository<ChapterProgress, Long> {
    Optional<ChapterProgress> findByUsuarioAndLivroAndChapterOrder(User usuario, Book livro, Integer chapterOrder);
    java.util.List<ChapterProgress> findByUsuarioAndLivro(User usuario, Book livro);
}
