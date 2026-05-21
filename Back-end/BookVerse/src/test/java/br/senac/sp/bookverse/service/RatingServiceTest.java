package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.RatingDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.model.Rating;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.RatingRepository;
import br.senac.sp.bookverse.repository.BookRepository;
import br.senac.sp.bookverse.repository.UserRepository;
import br.senac.sp.bookverse.security.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private RatingService ratingService;

    @Test
    void criar_deveAssociarAoUserAtual() {
        User usuario = usuario(1L, Role.USER);
        Book livro = livro(2L);
        when(currentUserService.authenticatedUser()).thenReturn(usuario);
        when(bookRepository.findById(2L)).thenReturn(Optional.of(livro));

        Rating salva = new Rating();
        salva.setId(9L);
        salva.setNota(5);
        salva.setDescricao("Ótimo");
        salva.setUsuario(usuario);
        salva.setLivro(livro);
        when(ratingRepository.save(org.mockito.ArgumentMatchers.any(Rating.class))).thenReturn(salva);

        RatingDTO resultado = ratingService.criar(new RatingDTO(null, 5, "Ótimo", 2L, null, null, null, null, null, null));

        assertEquals(9L, resultado.id());
        assertEquals(5, resultado.nota());
    }

    @Test
    void atualizar_deveBloquearUserNaoDono() {
        User atual = usuario(1L, Role.USER);
        User dono = usuario(2L, Role.USER);
        Book livro = livro(3L);
        Rating avaliacao = new Rating();
        avaliacao.setId(7L);
        avaliacao.setUsuario(dono);
        avaliacao.setLivro(livro);
        avaliacao.setNota(4);
        avaliacao.setDescricao("Bom");
        when(currentUserService.authenticatedUser()).thenReturn(atual);
        when(currentUserService.isAdmin(atual)).thenReturn(false);
        when(ratingRepository.findById(7L)).thenReturn(Optional.of(avaliacao));

        assertThrows(ResponseStatusException.class, () -> ratingService.atualizar(7L, new RatingDTO(null, 5, "x", 3L, null, null, null, null, null, null)));
    }

    @Test
    void criar_deveLancarException_quandoBookNaoExiste() {
        User usuario = usuario(1L, Role.USER);
        when(currentUserService.authenticatedUser()).thenReturn(usuario);
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> ratingService.criar(new RatingDTO(null, 5, "x", 99L, null, null, null, null, null, null)));
    }

    private static User usuario(Long id, Role role) {
        User usuario = new User();
        usuario.setId(id);
        usuario.setRole(role);
        usuario.setEmail("user" + id + "@bookverse.com");
        usuario.setSenha("senha");
        return usuario;
    }

    private static Book livro(Long id) {
        Book livro = new Book();
        livro.setId(id);
        livro.setTitulo("Book " + id);
        return livro;
    }
}

