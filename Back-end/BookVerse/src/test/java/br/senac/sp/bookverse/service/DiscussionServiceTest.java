package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.DiscussionDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.model.Discussion;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.repository.DiscussionRepository;
import br.senac.sp.bookverse.repository.BookRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DiscussionServiceTest {

    @Mock
    private DiscussionRepository discussionRepository;

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private DiscussionService discussaoService;

    @Test
    void criar_deveSalvarDiscussion() {
        Book livro = new Book();
        livro.setId(1L);
        livro.setTitulo("Book Base");
        when(bookRepository.findById(1L)).thenReturn(Optional.of(livro));

        Discussion salva = new Discussion();
        salva.setId(10L);
        salva.setTitulo("Tema 1");
        salva.setDescricao("Descricao");
        salva.setLivro(livro);
        when(discussionRepository.save(org.mockito.ArgumentMatchers.any(Discussion.class))).thenReturn(salva);

        DiscussionDTO resultado = discussaoService.criar(new DiscussionDTO(null, "Tema 1", "Descricao", 1L, null));

        assertEquals(10L, resultado.id());
        assertEquals("Tema 1", resultado.titulo());
        verify(discussionRepository).save(org.mockito.ArgumentMatchers.any(Discussion.class));
    }

    @Test
    void listarPorBook_deveFiltrarPorBook() {
        Book livro = new Book();
        livro.setId(1L);
        Discussion discussao = new Discussion();
        discussao.setId(10L);
        discussao.setTitulo("Tema 1");
        discussao.setDescricao("Descricao");
        discussao.setLivro(livro);
        when(discussionRepository.findByLivroId(1L)).thenReturn(List.of(discussao));

        List<DiscussionDTO> resultado = discussaoService.listarPorBook(1L);

        assertEquals(1, resultado.size());
        assertEquals("Tema 1", resultado.get(0).titulo());
    }

    @Test
    void criar_deveLancarException_quandoBookNaoExiste() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> discussaoService.criar(new DiscussionDTO(null, "Tema", "Desc", 99L, null)));
    }
}


