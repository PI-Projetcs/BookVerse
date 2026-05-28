package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.UserResponseDTO;
import br.senac.sp.bookverse.service.UserService;
import br.senac.sp.bookverse.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(br.senac.sp.bookverse.controller.UserController.class)
@AutoConfigureMockMvc(addFilters = true)
class UserStatusControllerTest {

    @Autowired
    MockMvc mvc;

    @MockBean
    UserService userService;

    @MockBean
    JwtTokenProvider jwtTokenProvider;

    @Test
    void CT02_BANIR_USUARIO_COMENTARIOS_devePermitirAdminBloquearUsuario() throws Exception {
        UserResponseDTO dto = new UserResponseDTO(7L, "User", "email", true, "USER");
        when(userService.atualizarStatus(org.mockito.ArgumentMatchers.eq(7L), org.mockito.ArgumentMatchers.any())).thenReturn(dto);

        String body = "{\"status\": \"blocked\"}";

        mvc.perform(put("/api/v1/users/7/status").with(user("admin").roles("ADMIN"))
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));
    }
}
