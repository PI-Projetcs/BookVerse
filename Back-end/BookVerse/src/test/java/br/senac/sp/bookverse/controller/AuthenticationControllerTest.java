package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.AuthenticationResponse;
import br.senac.sp.bookverse.dto.LoginRequest;
import br.senac.sp.bookverse.dto.RegistrationRequest;
import br.senac.sp.bookverse.dto.UserResponseDTO;
import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.service.AuthenticationService;
import br.senac.sp.bookverse.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthenticationControllerTest {

    @Test
    void login_deveFuncionar_naRotaVersionadaENaLegada() throws Exception {
        AuthenticationService authService = mock(AuthenticationService.class);
        UserService userService = mock(UserService.class);
        MockMvc mockMvc = criarMockMvc(authService, userService);

        AuthenticationResponse response = AuthenticationResponse.of(
                "token-123",
                new UserResponseDTO(1L, "Maria", "maria@bookverse.com", Role.USER)
        );
        org.mockito.Mockito.when(authService.login(any(LoginRequest.class))).thenReturn(response);

        String body = """
                {
                  "email": "maria@bookverse.com",
                  "senha": "123456"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("token-123"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("token-123"));

        verify(authService, org.mockito.Mockito.times(2)).login(any(LoginRequest.class));
    }

    @Test
    void register_deveFuncionar_naRotaVersionadaENaLegada() throws Exception {
        AuthenticationService authService = mock(AuthenticationService.class);
        UserService userService = mock(UserService.class);
        MockMvc mockMvc = criarMockMvc(authService, userService);

        UserResponseDTO created = new UserResponseDTO(10L, "João", "joao@bookverse.com", Role.USER);
        org.mockito.Mockito.when(userService.registrar(any(RegistrationRequest.class))).thenReturn(created);

        String body = """
                {
                  "nome": "João",
                  "email": "joao@bookverse.com",
                  "senha": "123456"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10));

        verify(userService, org.mockito.Mockito.times(2)).registrar(any(RegistrationRequest.class));
    }

    private MockMvc criarMockMvc(AuthenticationService authService, UserService userService) {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        return MockMvcBuilders.standaloneSetup(new AuthenticationController(authService, userService))
                .setValidator(validator)
                .build();
    }
}

