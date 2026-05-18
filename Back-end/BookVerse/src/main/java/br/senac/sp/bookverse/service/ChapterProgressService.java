package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.ChapterProgress;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.ChapterProgressRepository;
import br.senac.sp.bookverse.repository.BookRepository;
import br.senac.sp.bookverse.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ChapterProgressService {

    private final ChapterProgressRepository chapterProgressRepository;
    private final CurrentUserService currentUserService;
    private final BookRepository bookRepository;

    public ChapterProgressService(ChapterProgressRepository chapterProgressRepository, CurrentUserService currentUserService, BookRepository bookRepository) {
        this.chapterProgressRepository = chapterProgressRepository;
        this.currentUserService = currentUserService;
        this.bookRepository = bookRepository;
    }

    @Transactional
    public ChapterProgress updateStatus(Long bookId, Integer chapterOrder, String status) {
        User usuario = currentUserService.authenticatedUser();
        if (bookId == null) throw new RuntimeException("bookId não pode ser nulo");
        Book livro = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Book não encontrado"));

        Optional<ChapterProgress> existing = chapterProgressRepository.findByUsuarioAndLivroAndChapterOrder(usuario, livro, chapterOrder);
        ChapterProgress cp = existing.orElseGet(() -> {
            ChapterProgress n = new ChapterProgress();
            n.setUsuario(usuario);
            n.setLivro(livro);
            n.setChapterOrder(chapterOrder);
            return n;
        });

        cp.setStatus(status);
        return chapterProgressRepository.save(cp);
    }
}
