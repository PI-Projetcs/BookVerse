package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.CommentDTO;
import br.senac.sp.bookverse.service.CommentService;
import br.senac.sp.bookverse.service.RatingService;
import br.senac.sp.bookverse.repository.CommentRepository;
import br.senac.sp.bookverse.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(AdminModerationController.class)
@AutoConfigureMockMvc(addFilters = true)
class AdminModerationControllerTest {

    @Autowired
    MockMvc mvc;

    @MockBean
    CommentService commentService;

    @MockBean
    RatingService ratingService;

    @MockBean
    CommentRepository commentRepository;

    @MockBean
    JwtTokenProvider jwtTokenProvider;

    @Test
    void CT01_REMOVER_COMENTARIO_devePermitirAdminRejeitarComentario() throws Exception {
        CommentDTO dto = new CommentDTO(5L, "Conteúdo", null, 1L, "Tema", 2L, "User", null, "motivo", null, 0, false);
        when(commentService.rejectComment(anyLong(), org.mockito.ArgumentMatchers.anyString())).thenReturn(dto);

        String body = "{\"feedback\": \"Inappropriate\"}";

        mvc.perform(post("/api/v1/admin/comments-moderation/comments/5/reject")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    void CT01_LISTAR_MODERACAO_deveRetornarListaQuandoAdmin() throws Exception {
        when(commentService.listarParaModeracao(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any())).thenReturn(java.util.List.of());

        mvc.perform(get("/api/v1/admin/comments-moderation").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk());
    }
}
