package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UsuarioControllerValidacaoTest {

    @Test
    void atualizar_deveRetornarBadRequest_quandoEmailInvalido() throws Exception {
        UserService usuarioService = mock(UserService.class);
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new UserController(usuarioService))
                .setValidator(validator)
                .build();

        String body = """
                {
                  "email": "email-invalido"
                }
                """;

        mockMvc.perform(put("/users/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(usuarioService);
    }
}


