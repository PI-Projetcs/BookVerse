package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.Book;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
@ActiveProfiles("test")
class BookRepositoryTest {

    @Autowired
    private BookRepository bookRepository;

    @Test
    void findByAutor_deveRetornarLivrosDoAutor() {
        bookRepository.saveAll(List.of(
                livro("Livro 1", "Autor A", "Ficção", false),
                livro("Livro 2", "Autor A", "Drama", true),
                livro("Livro 3", "Autor B", "Ficção", false)
        ));

        List<Book> resultado = bookRepository.findByAutor("Autor A");

        assertEquals(2, resultado.size());
        assertTrue(resultado.stream().allMatch(book -> "Autor A".equals(book.getAutor())));
    }

    @Test
    void findByGenero_deveRetornarLivrosDoGenero() {
        bookRepository.saveAll(List.of(
                livro("Livro 1", "Autor A", "Ficção", false),
                livro("Livro 2", "Autor B", "Ficção", true),
                livro("Livro 3", "Autor C", "Drama", false)
        ));

        List<Book> resultado = bookRepository.findByGenero("Ficção");

        assertEquals(2, resultado.size());
        assertTrue(resultado.stream().allMatch(book -> "Ficção".equals(book.getGenero())));
    }

    @Test
    void findByDestaqueTrue_deveRetornarLivroDoMes() {
        bookRepository.saveAll(List.of(
                livro("Livro 1", "Autor A", "Ficção", false),
                livro("Livro do Mês", "Autor B", "Drama", true)
        ));

        List<Book> resultado = bookRepository.findByDestaqueTrue();

        assertEquals(1, resultado.size());
        assertEquals("Livro do Mês", resultado.get(0).getTitulo());
    }

    @Test
    void findByAno_deveRetornarLivrosDoPeriodo() {
        Book livro2020 = livro("Livro 2020", "Autor A", "Ficção", false);
        livro2020.setAno(2020);

        Book livro2021 = livro("Livro 2021", "Autor B", "Drama", false);
        livro2021.setAno(2021);

        Book livro2024 = livro("Livro 2024", "Autor C", "Ação", false);
        livro2024.setAno(2024);

        bookRepository.saveAll(List.of(livro2020, livro2021, livro2024));

        List<Book> resultado = bookRepository.findByAno(2021);

        assertEquals(1, resultado.size());
        assertEquals("Livro 2021", resultado.get(0).getTitulo());
        assertEquals(2021, resultado.get(0).getAno());
    }

    @Test
    void findByMediaAvaliacaoGreaterThanEqual_deveRetornarLivrosComAltaAvaliacao() {
        Book livro1 = livro("Livro Baixa Avaliação", "Autor A", "Ficção", false);
        livro1.setMediaAvaliacao(2.5);

        Book livro2 = livro("Livro Boa Avaliação", "Autor B", "Drama", false);
        livro2.setMediaAvaliacao(4.5);

        Book livro3 = livro("Livro Excelente", "Autor C", "Ação", false);
        livro3.setMediaAvaliacao(4.8);

        bookRepository.saveAll(List.of(livro1, livro2, livro3));

        List<Book> resultado = bookRepository.findByMediaAvaliacaoGreaterThanEqual(4.0);

        assertEquals(2, resultado.size());
        assertTrue(resultado.stream().allMatch(book -> book.getMediaAvaliacao() >= 4.0));
    }

    private static Book livro(String titulo, String autor, String genero, boolean destaque) {
        Book livro = new Book();
        livro.setTitulo(titulo);
        livro.setAutor(autor);
        livro.setGenero(genero);
        livro.setAno(2024);
        livro.setSinopse("Sinopse " + titulo);
        livro.setDestaque(destaque);
        livro.setMediaAvaliacao(4.0);
        return livro;
    }
}

