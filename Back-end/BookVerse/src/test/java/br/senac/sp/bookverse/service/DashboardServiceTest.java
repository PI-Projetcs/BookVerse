package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.DashboardDTO;
import br.senac.sp.bookverse.model.*;
import br.senac.sp.bookverse.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private DiscussionRepository discussionRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private RatingRepository ratingRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void obterDashboard_deveRetornarEstatisticas() {
        when(userRepository.count()).thenReturn(5L);
        when(bookRepository.count()).thenReturn(10L);
        when(discussionRepository.count()).thenReturn(15L);
        when(commentRepository.count()).thenReturn(20L);
        when(ratingRepository.count()).thenReturn(25L);
        when(ratingRepository.findAll()).thenReturn(List.of());
        when(bookRepository.findByDestaqueTrue()).thenReturn(List.of());

        DashboardDTO dashboard = dashboardService.obterDashboard();

        assertNotNull(dashboard);
        assertEquals(5L, dashboard.totalUsuarios());
        assertEquals(10L, dashboard.totalLivros());
        assertEquals(15L, dashboard.totalDiscussoes());
        assertEquals(20L, dashboard.totalComentarios());
        assertEquals(25L, dashboard.totalAvaliacoes());
    }

    @Test
    void obterDashboard_deveConterLivroDeDestaque() {
        Book livro = new Book();
        livro.setTitulo("Livro em Destaque");
        livro.setDestaque(true);

        when(userRepository.count()).thenReturn(1L);
        when(bookRepository.count()).thenReturn(1L);
        when(discussionRepository.count()).thenReturn(0L);
        when(commentRepository.count()).thenReturn(0L);
        when(ratingRepository.count()).thenReturn(0L);
        when(ratingRepository.findAll()).thenReturn(List.of());
        when(bookRepository.findByDestaqueTrue()).thenReturn(List.of(livro));

        DashboardDTO dashboard = dashboardService.obterDashboard();

        assertNotNull(dashboard.livroDestaqueAtuall());
        assertTrue(dashboard.livroDestaqueAtuall().contains("Livro em Destaque"));
    }

    @Test
    void obterDashboard_deveCalcularMediaAvaliacoes() {
        Rating rating = new Rating();
        rating.setNota(5);

        when(userRepository.count()).thenReturn(0L);
        when(bookRepository.count()).thenReturn(0L);
        when(discussionRepository.count()).thenReturn(0L);
        when(commentRepository.count()).thenReturn(0L);
        when(ratingRepository.count()).thenReturn(1L);
        when(ratingRepository.findAll()).thenReturn(List.of(rating));
        when(bookRepository.findByDestaqueTrue()).thenReturn(List.of());

        DashboardDTO dashboard = dashboardService.obterDashboard();

        assertNotNull(dashboard.mediaAvaliacoesGeral());
        assertTrue(dashboard.mediaAvaliacoesGeral() > 0);
    }
}

