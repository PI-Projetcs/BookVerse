package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.CommentDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.service.CommentService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CommentControllerTest {

    private MockMvc criarMockMvc(CommentService commentService) {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        return MockMvcBuilders.standaloneSetup(new CommentController(commentService))
                .setValidator(validator)
                .build();
    }

    @Test
    void criarComment_deveRetornar201_quandoValido() throws Exception {
        CommentService service = mock(CommentService.class);
        CommentDTO created = new CommentDTO(10L, "Conteúdo", null, 3L, "Tema", 1L, "User", null, null, null, 0, false);
        when(service.criar(any(CommentDTO.class))).thenReturn(created);

        MockMvc mvc = criarMockMvc(service);

        String body = """
                {
                  "conteudo": "Comentário útil",
                  "discussaoId": 3
                }
                """;

        mvc.perform(post("/api/v1/comments").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10));
    }

    @Test
    void criarComment_deveRejeitar_conteudoVazio() throws Exception {
        CommentService service = mock(CommentService.class);
        MockMvc mvc = criarMockMvc(service);

        String body = """
                {
                  "conteudo": "   ",
                  "discussaoId": 3
                }
                """;

        mvc.perform(post("/api/v1/comments").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void atualizarComment_deveRetornar200_quandoUsuarioProprio() throws Exception {
        CommentService service = mock(CommentService.class);
        CommentDTO updated = new CommentDTO(7L, "Editado", null, 3L, null, null, null, null, null, null, 0, false);
        when(service.atualizar(anyLong(), any(CommentDTO.class))).thenReturn(updated);

        MockMvc mvc = criarMockMvc(service);

        String body = """
                {
                  "conteudo": "Editado",
                  "discussaoId": 3
                }
                """;

        mvc.perform(put("/api/v1/comments/7").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conteudo").value("Editado"));
    }

    @Test
    void atualizarComment_deveRetornar403_quandoOutroUsuario() throws Exception {
        CommentService service = mock(CommentService.class);
        when(service.atualizar(anyLong(), any(CommentDTO.class))).thenThrow(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN));

        MockMvc mvc = criarMockMvc(service);

        String body = """
                {
                  "conteudo": "Tentativa",
                  "discussaoId": 3
                }
                """;

        mvc.perform(put("/api/v1/comments/7").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void deletarComment_deveRetornar204_quandoPermitido() throws Exception {
        CommentService service = mock(CommentService.class);
        MockMvc mvc = criarMockMvc(service);

        mvc.perform(delete("/api/v1/comments/7")).andExpect(status().isNoContent());
    }

    @Test
    void deletarComment_deveRetornar403_quandoNaoAutorizado() throws Exception {
        CommentService service = mock(CommentService.class);
        org.mockito.Mockito.doThrow(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                .when(service).deletar(7L);

        MockMvc mvc = criarMockMvc(service);

        mvc.perform(delete("/api/v1/comments/7")).andExpect(status().isForbidden());
    }
}
