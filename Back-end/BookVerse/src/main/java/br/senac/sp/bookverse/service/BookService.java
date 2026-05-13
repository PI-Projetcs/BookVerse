package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.BookDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.mapper.BookMapper;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.repository.BookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.StreamSupport;

@Service
public class BookService {
    private static final Logger log = LoggerFactory.getLogger(BookService.class);

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Transactional(readOnly = true)
    public List<BookDTO> listarTodos() {
        return StreamSupport.stream(bookRepository.findAll().spliterator(), false)
                .map(BookMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<BookDTO> listarTodos(Pageable pageable) {
        return bookRepository.findAll(pageable).map(BookMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public BookDTO buscarPorId(Long id) {
        return BookMapper.toDTO(buscarEntidadePorId(id));
    }

    @Transactional
    public BookDTO criar(BookDTO dto) {
        Book salvo = bookRepository.save(BookMapper.toEntity(dto));
        log.info("Livro criado com sucesso. id={}", salvo.getId());
        return BookMapper.toDTO(salvo);
    }

    @Transactional
    public BookDTO atualizar(Long id, BookDTO dto) {
        Book livro = buscarEntidadePorId(id);
        BookMapper.updateEntityFromDto(livro, dto);
        Book salvo = bookRepository.save(livro);
        log.info("Livro atualizado com sucesso. id={}", id);
        return BookMapper.toDTO(salvo);
    }

    @Transactional
    public void deletar(Long id) {
        Book livro = buscarEntidadePorId(id);
        bookRepository.delete(livro);
        log.info("Livro removido com sucesso. id={}", id);
    }

    @Transactional
    public BookDTO definirLivroDoMes(Long id) {
        Book livro = buscarEntidadePorId(id);

        // Remove destaque de outros livros do mês
        bookRepository.findByDestaqueTrue()
                .forEach(b -> {
                    b.setDestaque(false);
                    b.setDestaqueData(null);
                });

        // Define este livro como livro do mês
        livro.setDestaque(true);
        livro.setDestaqueData(LocalDateTime.now());
        Book salvo = bookRepository.save(livro);
        log.info("Livro definido como livro do mês. id={}, titulo={}", id, livro.getTitulo());
        return BookMapper.toDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<BookDTO> filtrarPorAutor(String autor) {
        log.debug("Filtrando livros por autor: {}", autor);
        return bookRepository.findByAutor(autor).stream()
                .map(BookMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookDTO> filtrarPorGenero(String genero) {
        log.debug("Filtrando livros por gênero: {}", genero);
        return bookRepository.findByGenero(genero).stream()
                .map(BookMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookDTO> filtrarPorAno(Integer ano) {
        log.debug("Filtrando livros por ano: {}", ano);
        return bookRepository.findByAno(ano).stream()
                .map(BookMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookDTO> filtrarPorAvaliacao(Double minima) {
        log.debug("Filtrando livros com avaliação mínima: {}", minima);
        return bookRepository.findByMediaAvaliacaoGreaterThanEqual(minima).stream()
                .map(BookMapper::toDTO)
                .toList();
    }

    private Book buscarEntidadePorId(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book não encontrado."));
    }
}