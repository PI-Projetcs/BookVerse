package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.LoginRequest;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.UserRepository;
import br.senac.sp.bookverse.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthenticationService authenticationService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void login_shouldReturnEmailInvalid_whenUserNotFound() {
        when(userRepository.findByEmail("noone@example.com")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                authenticationService.login(new LoginRequest("noone@example.com", "pass123"))
        );

        assertEquals(400, ex.getStatusCode().value());
        assertEquals("Email inválido.", ex.getReason());
    }

    @Test
    void login_shouldReturnSenhaIncorreta_whenAuthFails() {
        User user = new User();
        user.setEmail("user@test.com");
        user.setSenha("encoded");
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(org.mockito.ArgumentMatchers.any()))
                .thenThrow(new BadCredentialsException("bad"));

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () ->
                authenticationService.login(new LoginRequest("user@test.com", "wrongpass"))
        );

        assertEquals("Senha incorreta.", ex.getMessage());
    }
}
