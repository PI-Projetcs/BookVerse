package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.BookDTO;
import br.senac.sp.bookverse.service.BookService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping({"/api/v1/books", "/api/books", "/books"})
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBook(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.buscarPorId(id));
    }

    @GetMapping
        public ResponseEntity<Page<BookDTO>> getBooks(@PageableDefault(size = 20, sort = "id") Pageable pageable) {
            return ResponseEntity.ok(bookService.listarTodos(pageable));
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
}
