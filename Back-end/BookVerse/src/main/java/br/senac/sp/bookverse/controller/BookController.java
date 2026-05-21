package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.BookDTO;
import br.senac.sp.bookverse.service.BookService;
import br.senac.sp.bookverse.service.CommentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import br.senac.sp.bookverse.service.ChapterProgressService;
import br.senac.sp.bookverse.model.ChapterProgress;


@RestController
@RequestMapping({"/api/v1/books", "/api/books", "/books"})
public class BookController {

    private final BookService bookService;
    private final ChapterProgressService chapterProgressService;
    private final CommentService commentService;

    public BookController(BookService bookService, ChapterProgressService chapterProgressService, CommentService commentService) {
        this.bookService = bookService;
        this.chapterProgressService = chapterProgressService;
        this.commentService = commentService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBook(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.buscarPorId(id));
    }

    @GetMapping
        public ResponseEntity<Page<BookDTO>> getBooks(
                @PageableDefault(size = 20, sort = "id") Pageable pageable,
                @RequestParam(defaultValue = "false") boolean includeInactive
        ) {
            return ResponseEntity.ok(bookService.listarTodos(pageable, includeInactive));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookDTO> createBook(@Valid @RequestBody BookDTO dto) {
        BookDTO created = bookService.criar(dto);
            return ResponseEntity.created(
                    ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri()
            ).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookDTO> updateBook(@PathVariable Long id, @Valid @RequestBody BookDTO dto) {
        return ResponseEntity.ok(bookService.atualizar(id, dto));
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookDTO> updateBookActiveStatus(@PathVariable Long id, @RequestBody ActiveStatusRequest request) {
        if (request == null || request.ativo() == null) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo ativo é obrigatório.");
        }

        return ResponseEntity.ok(bookService.atualizarStatusAtivo(id, request.ativo()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/set-book-of-month")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookDTO> setBookOfMonth(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.definirLivroDoMes(id));
    }

    @GetMapping("/search/by-author")
    public ResponseEntity<?> searchByAutor(@RequestParam String autor) {
        return ResponseEntity.ok(bookService.filtrarPorAutor(autor));
    }

    @GetMapping("/search/by-genre")
    public ResponseEntity<?> searchByGenero(@RequestParam String genero) {
        return ResponseEntity.ok(bookService.filtrarPorGenero(genero));
    }

    @GetMapping("/search/by-year")
    public ResponseEntity<?> searchByAno(@RequestParam Integer ano) {
        return ResponseEntity.ok(bookService.filtrarPorAno(ano));
    }

    @GetMapping("/search/by-rating")
    public ResponseEntity<?> searchByAvaliacao(@RequestParam Double minima) {
        return ResponseEntity.ok(bookService.filtrarPorAvaliacao(minima));
    }

    @PutMapping("/{bookId}/chapters/{chapterOrder}/status")
    public ResponseEntity<ChapterProgress> updateChapterStatus(@PathVariable Long bookId, @PathVariable Integer chapterOrder, @RequestBody  java.util.Map<String, String> body) {
        String status = body.getOrDefault("status", "");
        ChapterProgress updated = chapterProgressService.updateStatus(bookId, chapterOrder, status);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{bookId}/discussions/{discussionId}/comments/{commentId}/like")
    public ResponseEntity<?> toggleCommentLike(
            @PathVariable Long bookId,
            @PathVariable Long discussionId,
            @PathVariable Long commentId,
            @RequestBody(required = false) java.util.Map<String, Object> body
    ) {
        Boolean liked = null;
        if (body != null && body.containsKey("liked")) {
            Object val = body.get("liked");
            if (val instanceof Boolean) liked = (Boolean) val;
            else if (val instanceof String) liked = Boolean.valueOf((String) val);
        }
        var result = commentService.toggleCommentLike(commentId, liked);
        return ResponseEntity.ok(java.util.Map.of("item", result));
    }

    private record ActiveStatusRequest(Boolean ativo) {
    }
}
