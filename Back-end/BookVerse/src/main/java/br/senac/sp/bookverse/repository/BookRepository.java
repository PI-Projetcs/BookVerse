package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByAutor(String autor);
    List<Book> findByGenero(String genero);
    List<Book> findByAno(Integer ano);
    List<Book> findByDestaqueTrue();
    List<Book> findByMediaAvaliacaoGreaterThanEqual(Double mediaAvaliacao);
}

