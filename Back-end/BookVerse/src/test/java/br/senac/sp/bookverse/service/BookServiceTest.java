package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.BookDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.repository.BookRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookService bookService;

    @Test
    void criar_devePersistirBook() {
        BookDTO dto = new BookDTO(null, "Book A", "Autor A", "Ficção", 2024, "Sinopse", "http://image.com", "Biografia A", true, 4.5);
        Book salvo = livro(dto);
        salvo.setId(1L);
        when(bookRepository.save(org.mockito.ArgumentMatchers.any(Book.class))).thenReturn(salvo);

        BookDTO resultado = bookService.criar(dto);

        assertEquals(1L, resultado.id());
        assertEquals("Book A", resultado.titulo());
        assertEquals("Biografia A", resultado.authorBio());
        verify(bookRepository).save(org.mockito.ArgumentMatchers.any(Book.class));
    }

    @Test
    void buscarPorId_deveLancarException_quandoNaoExiste() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bookService.buscarPorId(99L));
    }

    @Test
    void buscarPorId_deveRetornarBook_quandoExiste() {
        Book livro = livro(new BookDTO(1L, "Book B", "Autor B", "Drama", 2023, "Sinopse B", "", "Biografia B", false, 4.0));
        livro.setId(1L);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(livro));

        BookDTO resultado = bookService.buscarPorId(1L);

        assertEquals(1L, resultado.id());
        assertEquals("Book B", resultado.titulo());
    }

    @Test
    void listarTodos_deveRetornarPaginaDeBooks() {
        Book livro = livro(new BookDTO(1L, "Book C", "Autor C", "Ação", 2022, "Sinopse C", "", "Biografia C", true, 4.8));
        livro.setId(1L);
        Page<Book> page = new PageImpl<>(List.of(livro));
        when(bookRepository.findAll(PageRequest.of(0, 20, org.springframework.data.domain.Sort.by("id")))).thenReturn(page);

        Page<BookDTO> resultado = bookService.listarTodos(PageRequest.of(0, 20, org.springframework.data.domain.Sort.by("id")));

        assertEquals(1, resultado.getTotalElements());
        assertEquals("Book C", resultado.getContent().get(0).titulo());
    }

    @Test
    void definirLivroDoMes_deveMarcarComDestaqueEData() {
        Book livro = livro(new BookDTO(1L, "Book D", "Autor D", "Ficção", 2024, "Sinopse D", "", "Biografia D", false, 4.5));
        livro.setId(1L);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(livro));
        when(bookRepository.findByDestaqueTrue()).thenReturn(List.of());
        when(bookRepository.save(org.mockito.ArgumentMatchers.any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookDTO resultado = bookService.definirLivroDoMes(1L);

        assertNotNull(resultado);
        assertEquals("Book D", resultado.titulo());
        assertTrue(resultado.destaque());
        verify(bookRepository).findById(1L);
    }

    @Test
    void definirLivroDoMes_deveRemoverDestaqueDoOutroLivro() {
        Book livroAntigo = livro(new BookDTO(2L, "Book Antigo", "Autor X", "Ficção", 2023, "Sinopse X", "", "Biografia X", true, 4.0));
        livroAntigo.setId(2L);
        livroAntigo.setDestaqueData(LocalDateTime.now().minusMonths(1));

        Book livroNovo = livro(new BookDTO(1L, "Book D", "Autor D", "Ficção", 2024, "Sinopse D", "", "Biografia D", false, 4.5));
        livroNovo.setId(1L);

        when(bookRepository.findById(1L)).thenReturn(Optional.of(livroNovo));
        when(bookRepository.findByDestaqueTrue()).thenReturn(List.of(livroAntigo));
        when(bookRepository.save(org.mockito.ArgumentMatchers.any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookService.definirLivroDoMes(1L);

        // Verifica que o livro antigo foi marcado como não destaque
        assertEquals(false, livroAntigo.getDestaque());
    }

    @Test
    void filtrarPorAutor_deveRetornarLivrosDoAutor() {
        Book livro1 = livro(new BookDTO(1L, "Book A", "Autor A", "Ficção", 2024, "Sinopse", "", "Biografia A", true, 4.5));
        Book livro2 = livro(new BookDTO(2L, "Book B", "Autor A", "Drama", 2023, "Sinopse", "", "Biografia B", false, 4.0));
        Book livro3 = livro(new BookDTO(3L, "Book C", "Autor B", "Ação", 2022, "Sinopse", "", "Biografia C", false, 4.8));

        when(bookRepository.findByAutor("Autor A")).thenReturn(List.of(livro1, livro2));

        List<BookDTO> resultado = bookService.filtrarPorAutor("Autor A");

        assertEquals(2, resultado.size());
        assertTrue(resultado.stream().allMatch(b -> "Autor A".equals(b.autor())));
    }

    @Test
    void filtrarPorGenero_deveRetornarLivrosDoGenero() {
        Book livro1 = livro(new BookDTO(1L, "Book A", "Autor A", "Ficção", 2024, "Sinopse", "", "Biografia A", true, 4.5));
        Book livro2 = livro(new BookDTO(2L, "Book B", "Autor B", "Ficção", 2023, "Sinopse", "", "Biografia B", false, 4.0));

        when(bookRepository.findByGenero("Ficção")).thenReturn(List.of(livro1, livro2));

        List<BookDTO> resultado = bookService.filtrarPorGenero("Ficção");

        assertEquals(2, resultado.size());
        assertTrue(resultado.stream().allMatch(b -> "Ficção".equals(b.genero())));
    }

    @Test
    void filtrarPorAno_deveRetornarLivrosDoAno() {
        Book livro1 = livro(new BookDTO(1L, "Book A", "Autor A", "Ficção", 2024, "Sinopse", "", "Biografia A", true, 4.5));
        Book livro2 = livro(new BookDTO(2L, "Book B", "Autor B", "Drama", 2024, "Sinopse", "", "Biografia B", false, 4.0));

        when(bookRepository.findByAno(2024)).thenReturn(List.of(livro1, livro2));

        List<BookDTO> resultado = bookService.filtrarPorAno(2024);

        assertEquals(2, resultado.size());
        assertTrue(resultado.stream().allMatch(b -> 2024 == b.ano()));
    }

    @Test
    void filtrarPorAvaliacao_deveRetornarLivrosComAltaAvaliacao() {
        Book livro1 = livro(new BookDTO(1L, "Book A", "Autor A", "Ficção", 2024, "Sinopse", "", "Biografia A", true, 4.5));
        Book livro2 = livro(new BookDTO(2L, "Book B", "Autor B", "Drama", 2023, "Sinopse", "", "Biografia B", false, 4.8));

        when(bookRepository.findByMediaAvaliacaoGreaterThanEqual(4.0)).thenReturn(List.of(livro1, livro2));

        List<BookDTO> resultado = bookService.filtrarPorAvaliacao(4.0);

        assertEquals(2, resultado.size());
        assertTrue(resultado.stream().allMatch(b -> b.mediaAvaliacao() >= 4.0));
    }

    private static Book livro(BookDTO dto) {
        Book livro = new Book();
        livro.setTitulo(dto.titulo());
        livro.setAutor(dto.autor());
        livro.setGenero(dto.genero());
        livro.setAno(dto.ano());
        livro.setSinopse(dto.sinopse());
        livro.setAuthorBio(dto.authorBio());
        livro.setDestaque(dto.destaque());
            livro.setMediaAvaliacao(dto.mediaAvaliacao());
        return livro;
    }
}

