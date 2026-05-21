package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    Page<Book> findByAtivoTrue(Pageable pageable);
    List<Book> findByAtivoTrue();
    List<Book> findByAtivoTrueAndAutor(String autor);
    List<Book> findByAtivoTrueAndGenero(String genero);
    List<Book> findByAtivoTrueAndAno(Integer ano);
    List<Book> findByAtivoTrueAndDestaqueTrue();
    List<Book> findByDestaqueTrue();
    List<Book> findByAtivoTrueAndMediaAvaliacaoGreaterThanEqual(Double mediaAvaliacao);

    @Query(value = "select b from Book b where b.ativo = true or b.ativo is null", countQuery = "select count(b) from Book b where b.ativo = true or b.ativo is null")
    Page<Book> findVisibleBooks(Pageable pageable);

    @Query("select b from Book b where b.ativo = true or b.ativo is null")
    List<Book> findVisibleBooks();

    @Query("select b from Book b where (b.ativo = true or b.ativo is null) and b.autor = :autor")
    List<Book> findVisibleBooksByAutor(@Param("autor") String autor);

    @Query("select b from Book b where (b.ativo = true or b.ativo is null) and b.genero = :genero")
    List<Book> findVisibleBooksByGenero(@Param("genero") String genero);

    @Query("select b from Book b where (b.ativo = true or b.ativo is null) and b.ano = :ano")
    List<Book> findVisibleBooksByAno(@Param("ano") Integer ano);

    @Query("select b from Book b where (b.ativo = true or b.ativo is null) and b.destaque = true")
    List<Book> findVisibleFeaturedBooks();

    @Query("select b from Book b where (b.ativo = true or b.ativo is null) and b.mediaAvaliacao >= :mediaAvaliacao")
    List<Book> findVisibleBooksByMediaAvaliacaoGreaterThanEqual(@Param("mediaAvaliacao") Double mediaAvaliacao);
}

