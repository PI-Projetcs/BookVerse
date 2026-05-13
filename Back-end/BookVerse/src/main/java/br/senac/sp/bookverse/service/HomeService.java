package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.HomeDTO;
import br.senac.sp.bookverse.dto.HomeDTO.ChapterDTO;
import br.senac.sp.bookverse.dto.HomeDTO.HighlightDTO;
import br.senac.sp.bookverse.dto.HomeDTO.ProgressDTO;
import br.senac.sp.bookverse.mapper.BookMapper;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.ReadingHistory;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.BookRepository;
import br.senac.sp.bookverse.repository.ReadingHistoryRepository;
import br.senac.sp.bookverse.security.CurrentUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HomeService {

    private static final Logger log = LoggerFactory.getLogger(HomeService.class);

    private final BookRepository bookRepository;
    private final ReadingHistoryRepository readingHistoryRepository;
    private final CurrentUserService currentUserService;

    public HomeService(
            BookRepository bookRepository,
            ReadingHistoryRepository readingHistoryRepository,
            CurrentUserService currentUserService
    ) {
        this.bookRepository = bookRepository;
        this.readingHistoryRepository = readingHistoryRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public HomeDTO obterHome() {
        log.info("Gerando dados de Home");

        User usuarioAtual = null;
        try {
            usuarioAtual = currentUserService.authenticatedUser();
        } catch (Exception e) {
            log.debug("Home acessado sem autenticação - retornando dados públicos");
        }

        Optional<Book> livroDoMes = bookRepository.findByDestaqueTrue().stream().findFirst();

        List<ReadingHistory> historicoLeitura = usuarioAtual != null
                ? readingHistoryRepository.findByUsuarioId(usuarioAtual.getId())
                : List.of();

        ProgressDTO progress = calcularProgresso(historicoLeitura, usuarioAtual);
        List<ChapterDTO> chapters = gerarCapitulos();
        List<HighlightDTO> highlights = gerarHighlights();

        HomeDTO home = new HomeDTO(
                livroDoMes.map(BookMapper::toDTO).orElse(null),
                progress,
                chapters,
                highlights
        );

        if (usuarioAtual != null) {
            log.info("Home gerado com sucesso para usuário={}", usuarioAtual.getId());
        } else {
            log.info("Home gerado com sucesso para acesso anônimo");
        }
        return home;
    }

    private ProgressDTO calcularProgresso(List<ReadingHistory> historicos, User usuario) {
        if (usuario == null) {
            return new ProgressDTO(0, 0, 0, 1);
        }

        ReadingHistory historicoUsuario = historicos.stream()
                .filter(h -> h.getUsuario() != null
                        && h.getUsuario().getId() != null
                        && h.getUsuario().getId().equals(usuario.getId()))
                .findFirst()
                .orElse(null);

        if (historicoUsuario == null) {
            return new ProgressDTO(0, 0, 0, 1);
        }

        Integer paginaAtual = historicoUsuario.getProgresso() != null ? historicoUsuario.getProgresso() : 0;
        Integer totalPaginas = historicoUsuario.getLivro() != null && historicoUsuario.getLivro().getPaginas() != null
                ? historicoUsuario.getLivro().getPaginas()
                : 0;

        Integer semanasConcluidas = paginaAtual > 0 ? (paginaAtual / 50) : 0;

        return new ProgressDTO(
                paginaAtual,
                totalPaginas,
                semanasConcluidas,
                1
        );
    }

    private List<ChapterDTO> gerarCapitulos() {
        List<ChapterDTO> chapters = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            String estado = i <= 2 ? "done" : i == 3 ? "active" : "locked";
            String status = i <= 2 ? "Concluído" : i == 3 ? "Em leitura" : "Bloqueado";

            chapters.add(new ChapterDTO(
                    (long) i,
                    "Capítulo " + i,
                    status,
                    estado
            ));
        }
        return chapters;
    }

    private List<HighlightDTO> gerarHighlights() {
        List<HighlightDTO> highlights = new ArrayList<>();

        highlights.add(new HighlightDTO(
                1L,
                "A leitura é a chave para novas dimensões.",
                "Comunidade",
                42,
                false
        ));

        highlights.add(new HighlightDTO(
                2L,
                "Cada livro é uma porta para outro mundo.",
                "Comunidade",
                38,
                false
        ));

        highlights.add(new HighlightDTO(
                3L,
                "Palavras são magia, histórias são vidas.",
                "Comunidade",
                55,
                false
        ));

        return highlights;
    }

    @Transactional
    public ProgressDTO atualizarProgresso(ProgressDTO progressDTO) {
        log.info("Atualizando progresso de leitura");
        // Por enquanto, apenas retorna o DTO recebido
        // Em produção, isso seria persistido no banco
        return progressDTO;
    }

    @Transactional
    public HighlightDTO toggleHighlightLike(Long highlightId, Boolean liked) {
        log.info("Alternando like do highlight={}, liked={}", highlightId, liked);
        // Por enquanto, gera um highlight de exemplo
        // Em produção, isso seria persistido no banco
        return new HighlightDTO(
                highlightId,
                "Destaque exemplo",
                "Comunidade",
                liked ? 1 : 0,
                liked
        );
    }
}