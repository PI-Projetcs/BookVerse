package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.CommentDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.model.Comment;
import br.senac.sp.bookverse.model.Discussion;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.CommentRepository;
import br.senac.sp.bookverse.repository.DiscussionRepository;
import br.senac.sp.bookverse.security.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private DiscussionRepository discussionRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private br.senac.sp.bookverse.repository.CommentLikeRepository commentLikeRepository;

    @InjectMocks
    private CommentService commentService;

    @Test
    void criar_deveAssociarAoUserAtual() {
        User usuario = usuario(1L, Role.USER);
        Discussion discussao = discussao();
        when(currentUserService.authenticatedUser()).thenReturn(usuario);
        when(discussionRepository.findById(3L)).thenReturn(Optional.of(discussao));

        Comment salvo = new Comment();
        salvo.setId(9L);
        salvo.setConteudo("Bom ponto");
        salvo.setData(LocalDateTime.now());
        salvo.setUsuario(usuario);
        salvo.setDiscussao(discussao);
        when(commentRepository.save(org.mockito.ArgumentMatchers.any(Comment.class))).thenReturn(salvo);

        CommentDTO resultado = commentService.criar(new CommentDTO(null, "Bom ponto", null, 3L, null, null, null, 0, false));

        assertEquals(9L, resultado.id());
        assertEquals("Bom ponto", resultado.conteudo());
        assertNotNull(resultado.data());
        verify(commentRepository).save(org.mockito.ArgumentMatchers.any(Comment.class));
    }

    @Test
    void deletar_deveBloquearUserNaoDono() {
        User atual = usuario(1L, Role.USER);
        User dono = usuario(2L, Role.USER);
        Discussion discussao = discussao();
        Comment comentario = new Comment();
        comentario.setId(7L);
        comentario.setUsuario(dono);
        comentario.setDiscussao(discussao);
        when(currentUserService.authenticatedUser()).thenReturn(atual);
        when(currentUserService.isAdmin(atual)).thenReturn(false);
        when(commentRepository.findById(7L)).thenReturn(Optional.of(comentario));

        assertThrows(ResponseStatusException.class, () -> commentService.deletar(7L));
    }

    @Test
    void criar_deveLancarException_quandoDiscussionNaoExiste() {
        User usuario = usuario(1L, Role.USER);
        when(currentUserService.authenticatedUser()).thenReturn(usuario);
        when(discussionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> commentService.criar(new CommentDTO(null, "x", null, 99L, null, null, null, 0, false)));
    }

    @Test
    void atualizar_devePermitirAdminEditarComentarioDeOutroUsuario() {
        User admin = usuario(10L, Role.ADMIN);
        User dono = usuario(2L, Role.USER);
        Discussion discussao = discussao();
        Comment comentario = new Comment();
        comentario.setId(7L);
        comentario.setConteudo("Original");
        comentario.setUsuario(dono);
        comentario.setDiscussao(discussao);

        when(currentUserService.authenticatedUser()).thenReturn(admin);
        when(currentUserService.isAdmin(admin)).thenReturn(true);
        when(commentRepository.findById(7L)).thenReturn(Optional.of(comentario));
        when(discussionRepository.findById(3L)).thenReturn(Optional.of(discussao));
        when(commentRepository.save(comentario)).thenReturn(comentario);

        CommentDTO resultado = commentService.atualizar(7L, new CommentDTO(7L, "Editado", null, 3L, null, null, null, 0, false));

        assertEquals("Editado", resultado.conteudo());
        verify(commentRepository).save(comentario);
    }

    @Test
    void deletar_devePermitirAdminExcluirComentarioDeOutroUsuario() {
        User admin = usuario(10L, Role.ADMIN);
        User dono = usuario(2L, Role.USER);
        Comment comentario = new Comment();
        comentario.setId(7L);
        comentario.setUsuario(dono);
        comentario.setDiscussao(discussao());

        when(currentUserService.authenticatedUser()).thenReturn(admin);
        when(currentUserService.isAdmin(admin)).thenReturn(true);
        when(commentRepository.findById(7L)).thenReturn(Optional.of(comentario));

        commentService.deletar(7L);

        verify(commentRepository).delete(comentario);
    }

    private static User usuario(Long id, Role role) {
        User usuario = new User();
        usuario.setId(id);
        usuario.setRole(role);
        usuario.setEmail("user" + id + "@bookverse.com");
        usuario.setSenha("senha");
        return usuario;
    }

    private static Discussion discussao() {
        Discussion discussao = new Discussion();
        discussao.setId(3L);
        Book livro = new Book();
        livro.setId(1L);
        discussao.setLivro(livro);
        discussao.setTitulo("Tema");
        discussao.setDescricao("Desc");
        return discussao;
    }
}

