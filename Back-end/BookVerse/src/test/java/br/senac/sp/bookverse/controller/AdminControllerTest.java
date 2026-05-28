package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.DashboardDTO;
import br.senac.sp.bookverse.service.DashboardService;
import br.senac.sp.bookverse.service.RatingService;
import br.senac.sp.bookverse.service.CommentService;
import br.senac.sp.bookverse.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import br.senac.sp.bookverse.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = true)
class AdminControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CommentService commentService;

    @MockBean
    private RatingService ratingService;

    @MockBean
    private UserService userService;

    @Test
    void CT01_DASHBOARD_ADMIN_ACESSO_devePermitirAcessoParaAdmin() throws Exception {
        DashboardDTO dto = new DashboardDTO(1L, 2L, 3L, 4L, 5L, 4.5, "Destaque");
        when(dashboardService.obterDashboard()).thenReturn(dto);

        mvc.perform(get("/api/v1/admin/dashboard").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsuarios").value(1));
    }

    @Test
    void CT02_DASHBOARD_SEM_PERMISSAO_deveBloquearUsuarioComum() throws Exception {
        mvc.perform(get("/api/v1/admin/dashboard").with(user("user").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void CT03_CONFLITO_EDICAO_devePropagarConflitoComoRespostaAdequada() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Conflito"))
                .when(userService).promoverParaAdmin(anyLong());

        mvc.perform(post("/api/v1/admin/users/7/promote").with(user("admin").roles("ADMIN")))
                .andExpect(status().isConflict());
    }

    @Test
    void CT04_PERMISSAO_USUARIO_deveBloquearPromocaoPorUsuarioComum() throws Exception {
        mvc.perform(post("/api/v1/admin/users/7/promote").with(user("user").roles("USER")))
                .andExpect(status().isForbidden());
    }
}
