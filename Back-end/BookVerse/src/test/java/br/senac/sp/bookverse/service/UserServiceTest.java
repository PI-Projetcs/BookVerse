package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.security.CurrentUserService;
import br.senac.sp.bookverse.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private UserService usuarioService;

    @AfterEach
    void clearContext() {
    }

    @Test
    void deletar_deveRetornarForbidden_quandoUserNaoEhAdmin() {
        User leitor = usuario(1L, "Leitor", "leitor@bookverse.com", Role.USER);
        when(currentUserService.authenticatedUser()).thenReturn(leitor);
        when(currentUserService.isAdmin(leitor)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> usuarioService.deletar(2L));

        assertEquals(403, ex.getStatusCode().value());
        verify(userRepository, never()).delete(org.mockito.ArgumentMatchers.any(User.class));
    }

    @Test
    void deletar_deveExcluir_quandoUserEhAdmin() {
        User admin = usuario(10L, "Admin", "admin@bookverse.com", Role.ADMIN);
        User alvo = usuario(2L, "Alvo", "alvo@bookverse.com", Role.USER);

        when(currentUserService.authenticatedUser()).thenReturn(admin);
        when(currentUserService.isAdmin(admin)).thenReturn(true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(alvo));

        usuarioService.deletar(2L);

        verify(userRepository).delete(alvo);
    }

    @Test
    void deletar_deveRetornarForbidden_quandoAlvoEhAdmin() {
        User adminExecutor = usuario(10L, "Admin", "admin@bookverse.com", Role.ADMIN);
        User adminAlvo = usuario(11L, "Admin 2", "admin2@bookverse.com", Role.ADMIN);

        when(currentUserService.authenticatedUser()).thenReturn(adminExecutor);
        when(currentUserService.isAdmin(adminExecutor)).thenReturn(true);
        when(userRepository.findById(11L)).thenReturn(Optional.of(adminAlvo));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> usuarioService.deletar(11L));

        assertEquals(403, ex.getStatusCode().value());
        verify(userRepository, never()).delete(adminAlvo);
    }

    @Test
    void deletar_deveRetornarForbidden_quandoAdminTentaSeAutoExcluir() {
        User admin = usuario(10L, "Admin", "admin@bookverse.com", Role.ADMIN);

        when(currentUserService.authenticatedUser()).thenReturn(admin);
        when(currentUserService.isAdmin(admin)).thenReturn(true);
        when(userRepository.findById(10L)).thenReturn(Optional.of(admin));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> usuarioService.deletar(10L));

        assertEquals(403, ex.getStatusCode().value());
        verify(userRepository, never()).delete(admin);
    }

    @Test
    void deletar_deveRetornarNotFound_quandoIdNaoExiste() {
        User admin = usuario(10L, "Admin", "admin@bookverse.com", Role.ADMIN);

        when(currentUserService.authenticatedUser()).thenReturn(admin);
        when(currentUserService.isAdmin(admin)).thenReturn(true);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> usuarioService.deletar(99L));
    }

    @Test
    void listarTodos_deveRetornarPaginaDeUsuarios() {
        User usuario = usuario(1L, "Leitor", "leitor@bookverse.com", Role.USER);
        when(userRepository.findAll(PageRequest.of(0, 20, org.springframework.data.domain.Sort.by("id"))))
                .thenReturn(new PageImpl<>(List.of(usuario)));

        Page<br.senac.sp.bookverse.dto.UserResponseDTO> resultado = usuarioService.listarTodos(
                PageRequest.of(0, 20, org.springframework.data.domain.Sort.by("id"))
        );

        assertEquals(1, resultado.getTotalElements());
        assertEquals("Leitor", resultado.getContent().get(0).nome());
    }

    @Test
    void atualizar_devePermitirAdminAlterarRole() {
        User admin = usuario(10L, "Admin", "admin@bookverse.com", Role.ADMIN);
        User alvo = usuario(2L, "Alvo", "alvo@bookverse.com", Role.USER);

        when(currentUserService.authenticatedUser()).thenReturn(admin);
        when(currentUserService.isAdmin(admin)).thenReturn(true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(alvo));
        when(userRepository.save(alvo)).thenReturn(alvo);

        br.senac.sp.bookverse.dto.UserUpdateDTO dto = new br.senac.sp.bookverse.dto.UserUpdateDTO(
                null, null, null, Role.ADMIN
        );

        var resultado = usuarioService.atualizar(2L, dto);

        assertEquals(Role.ADMIN, resultado.role());
    }

    @Test
    void atualizar_deveRetornarForbidden_quandoTentarRebaixarContaAdmin() {
        User adminExecutor = usuario(10L, "Admin", "admin@bookverse.com", Role.ADMIN);
        User adminAlvo = usuario(11L, "Admin 2", "admin2@bookverse.com", Role.ADMIN);

        when(currentUserService.authenticatedUser()).thenReturn(adminExecutor);
        when(currentUserService.isAdmin(adminExecutor)).thenReturn(true);
        when(userRepository.findById(11L)).thenReturn(Optional.of(adminAlvo));

        br.senac.sp.bookverse.dto.UserUpdateDTO dto = new br.senac.sp.bookverse.dto.UserUpdateDTO(
                null, null, null, Role.USER
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> usuarioService.atualizar(11L, dto));

        assertEquals(403, ex.getStatusCode().value());
        verify(userRepository, never()).save(adminAlvo);
    }

    @Test
    void atualizarStatus_deveBloquearUsuarioComum_quandoExecutorEhAdmin() {
        User admin = usuario(10L, "Admin", "admin@bookverse.com", Role.ADMIN);
        User alvo = usuario(2L, "Alvo", "alvo@bookverse.com", Role.USER);
        alvo.setAtivo(true);

        when(currentUserService.authenticatedUser()).thenReturn(admin);
        when(currentUserService.isAdmin(admin)).thenReturn(true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(alvo));
        when(userRepository.save(alvo)).thenReturn(alvo);

        var resultado = usuarioService.atualizarStatus(2L, new br.senac.sp.bookverse.dto.UserStatusUpdateDTO("blocked"));

        assertEquals("blocked", resultado.status());
        assertEquals(Boolean.FALSE, alvo.getAtivo());
        verify(userRepository).save(alvo);
    }

    @Test
    void atualizarStatus_deveRetornarForbidden_quandoAlvoEhAdmin() {
        User adminExecutor = usuario(10L, "Admin", "admin@bookverse.com", Role.ADMIN);
        User adminAlvo = usuario(11L, "Admin 2", "admin2@bookverse.com", Role.ADMIN);

        when(currentUserService.authenticatedUser()).thenReturn(adminExecutor);
        when(currentUserService.isAdmin(adminExecutor)).thenReturn(true);
        when(userRepository.findById(11L)).thenReturn(Optional.of(adminAlvo));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> usuarioService.atualizarStatus(11L, new br.senac.sp.bookverse.dto.UserStatusUpdateDTO("blocked"))
        );

        assertEquals(403, ex.getStatusCode().value());
        verify(userRepository, never()).save(adminAlvo);
    }

    @Test
    void atualizarStatus_deveRetornarForbidden_quandoExecutorNaoEhAdmin() {
        User leitor = usuario(1L, "Leitor", "leitor@bookverse.com", Role.USER);

        when(currentUserService.authenticatedUser()).thenReturn(leitor);
        when(currentUserService.isAdmin(leitor)).thenReturn(false);

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> usuarioService.atualizarStatus(2L, new br.senac.sp.bookverse.dto.UserStatusUpdateDTO("blocked"))
        );

        assertEquals(403, ex.getStatusCode().value());
    }

    @Test
    void atualizarStatus_deveRetornarBadRequest_quandoStatusInvalido() {
        User admin = usuario(10L, "Admin", "admin@bookverse.com", Role.ADMIN);
        User alvo = usuario(2L, "Alvo", "alvo@bookverse.com", Role.USER);

        when(currentUserService.authenticatedUser()).thenReturn(admin);
        when(currentUserService.isAdmin(admin)).thenReturn(true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(alvo));

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> usuarioService.atualizarStatus(2L, new br.senac.sp.bookverse.dto.UserStatusUpdateDTO("paused"))
        );

        assertEquals(400, ex.getStatusCode().value());
        verify(userRepository, never()).save(alvo);
    }


    private static User usuario(Long id, String nome, String email, Role role) {
        User usuario = new User();
        usuario.setId(id);
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setRole(role);
        usuario.setAtivo(true);
        usuario.setSenha("senha");
        return usuario;
    }
}

