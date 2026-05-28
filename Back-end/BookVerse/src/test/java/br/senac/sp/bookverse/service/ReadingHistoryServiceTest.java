package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.ReadingHistoryDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.model.ReadingHistory;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.model.ReadingStatus;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.ReadingHistoryRepository;
import br.senac.sp.bookverse.repository.BookRepository;
import br.senac.sp.bookverse.repository.UserRepository;
import br.senac.sp.bookverse.security.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReadingHistoryServiceTest {

    @Mock
    private ReadingHistoryRepository readingHistoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private AchievementService achievementService;

    @InjectMocks
    private ReadingHistoryService historicoLeituraService;

    @Test
    void criar_deveAssociarAoUserAtual() {
        User usuario = usuario(1L, Role.USER);
        Book livro = livro(2L);
        when(currentUserService.authenticatedUser()).thenReturn(usuario);
        when(bookRepository.findById(2L)).thenReturn(Optional.of(livro));

        ReadingHistory salvo = new ReadingHistory();
        salvo.setId(9L);
        salvo.setStatus(ReadingStatus.READING);
        salvo.setProgresso(30);
        salvo.setUsuario(usuario);
        salvo.setLivro(livro);
        when(readingHistoryRepository.save(org.mockito.ArgumentMatchers.any(ReadingHistory.class))).thenReturn(salvo);
        when(achievementService.avaliarERegistrarConquistasDoUsuario(1L)).thenReturn(null);

        ReadingHistoryDTO resultado = historicoLeituraService.criar(new ReadingHistoryDTO(null, ReadingStatus.READING, 30, 2L, null, null, null));

        assertEquals(9L, resultado.id());
        assertEquals(ReadingStatus.READING, resultado.status());
        verify(readingHistoryRepository).save(org.mockito.ArgumentMatchers.any(ReadingHistory.class));
    }

    @Test
    void listarDoUserAutenticado_deveBuscarSomenteDoUser() {
        User usuario = usuario(1L, Role.USER);
        when(currentUserService.authenticatedUser()).thenReturn(usuario);
        ReadingHistory historico = new ReadingHistory();
        historico.setId(3L);
        historico.setStatus(ReadingStatus.COMPLETE);
        historico.setProgresso(100);
        historico.setUsuario(usuario);
        historico.setLivro(livro(2L));
        when(readingHistoryRepository.findByUsuarioId(1L)).thenReturn(List.of(historico));

        List<ReadingHistoryDTO> resultado = historicoLeituraService.listarDoUserAutenticado();

        assertEquals(1, resultado.size());
        assertEquals(3L, resultado.get(0).id());
    }

    @Test
    void deletar_deveBloquearQuandoNaoEhDonoNemAdmin() {
        User atual = usuario(1L, Role.USER);
        User dono = usuario(2L, Role.USER);
        ReadingHistory historico = new ReadingHistory();
        historico.setId(7L);
        historico.setUsuario(dono);
        historico.setLivro(livro(2L));
        when(currentUserService.authenticatedUser()).thenReturn(atual);
        when(currentUserService.isAdmin(atual)).thenReturn(false);
        when(readingHistoryRepository.findById(7L)).thenReturn(Optional.of(historico));

        assertThrows(ResponseStatusException.class, () -> historicoLeituraService.deletar(7L));
    }

    @Test
    void criar_deveLancarException_quandoBookNaoExiste() {
        User usuario = usuario(1L, Role.USER);
        when(currentUserService.authenticatedUser()).thenReturn(usuario);
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> historicoLeituraService.criar(new ReadingHistoryDTO(null, ReadingStatus.READING, 10, 99L, null, null, null)));
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


