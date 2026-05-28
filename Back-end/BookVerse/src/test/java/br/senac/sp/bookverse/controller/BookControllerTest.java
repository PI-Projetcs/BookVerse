package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.BookDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.service.BookService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BookControllerTest {

    private MockMvc criarMockMvc(BookService bookService) {
        return MockMvcBuilders.standaloneSetup(new BookController(bookService, null, null)).build();
    }

    @Test
    void getBook_deveRetornar200_quandoLivroExiste() throws Exception {
        BookService bookService = mock(BookService.class);
        BookDTO dto = new BookDTO(1L, "Titulo", "Autor", "Genero", 2023, "Sinopse", "img", "bio", true, 4.5);
        when(bookService.buscarPorId(1L)).thenReturn(dto);

        MockMvc mockMvc = criarMockMvc(bookService);

        mockMvc.perform(get("/api/v1/books/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.titulo").value("Titulo"));
    }

    @Test
    void getBook_deveRetornar404_quandoLivroNaoExiste() throws Exception {
        BookService bookService = mock(BookService.class);
        when(bookService.buscarPorId(anyLong())).thenThrow(new ResourceNotFoundException("Book não encontrado."));

        MockMvc mockMvc = criarMockMvc(bookService);

        mockMvc.perform(get("/api/v1/books/99").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
