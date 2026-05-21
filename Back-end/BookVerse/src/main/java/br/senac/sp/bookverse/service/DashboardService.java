package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.DashboardDTO;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final DiscussionRepository discussionRepository;
    private final CommentRepository commentRepository;
    private final RatingRepository ratingRepository;

    public DashboardService(
            UserRepository userRepository,
            BookRepository bookRepository,
            DiscussionRepository discussionRepository,
            CommentRepository commentRepository,
            RatingRepository ratingRepository
    ) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.discussionRepository = discussionRepository;
        this.commentRepository = commentRepository;
        this.ratingRepository = ratingRepository;
    }

    @Transactional(readOnly = true)
    public DashboardDTO obterDashboard() {
        log.info("Gerando dados do dashboard administrativo");

        Long totalUsuarios = userRepository.count();
        Long totalLivros = bookRepository.count();
        Long totalDiscussoes = discussionRepository.count();
        Long totalComentarios = commentRepository.count();
        Long totalAvaliacoes = ratingRepository.count();

        Double mediaAvaliacoesGeral = ratingRepository.findAll()
                .stream()
                .mapToDouble(r -> r.getNota())
                .average()
                .orElse(0.0);

        String livroDestaqueAtual = bookRepository.findByAtivoTrueAndDestaqueTrue()
                .stream()
                .map(Book::getTitulo)
                .collect(Collectors.joining(", "));

        DashboardDTO dashboard = new DashboardDTO(
                totalUsuarios,
                totalLivros,
                totalDiscussoes,
                totalComentarios,
                totalAvaliacoes,
                mediaAvaliacoesGeral,
                livroDestaqueAtual.isEmpty() ? "Nenhum" : livroDestaqueAtual
        );

        log.info("Dashboard gerado com sucesso. Total de usuários: {}, Total de livros: {}", totalUsuarios, totalLivros);
        return dashboard;
    }
}

