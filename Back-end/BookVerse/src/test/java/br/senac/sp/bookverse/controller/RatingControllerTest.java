package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.RatingDTO;
import br.senac.sp.bookverse.service.RatingService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RatingControllerTest {

    private MockMvc criarMockMvc(RatingService ratingService) {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        return MockMvcBuilders.standaloneSetup(new RatingController(ratingService))
                .setValidator(validator)
                .build();
    }

    @Test
    void criarRating_deveRejeitar_notaForaRange() throws Exception {
        RatingService service = mock(RatingService.class);
        MockMvc mvc = criarMockMvc(service);

        String body = """
                {
                  "nota": 7,
                  "descricao": "Muito bom",
                  "livroId": 2
                }
                """;

        mvc.perform(post("/api/v1/ratings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void criarRating_deveRetornar201_quandoValido() throws Exception {
        RatingService service = mock(RatingService.class);
        RatingDTO created = new RatingDTO(10L, 5, "Ótimo", 2L, "Book 2", 1L, "User", null, null, null);
        when(service.criar(any(RatingDTO.class))).thenReturn(created);

        MockMvc mvc = criarMockMvc(service);

        String body = """
                {
                  "nota": 5,
                  "descricao": "Muito bom",
                  "livroId": 2
                }
                """;

        mvc.perform(post("/api/v1/ratings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }
}
