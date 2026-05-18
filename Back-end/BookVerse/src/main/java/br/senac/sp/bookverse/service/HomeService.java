package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.HomeDTO;
import br.senac.sp.bookverse.dto.HomeDTO.ChapterDTO;
import br.senac.sp.bookverse.dto.HomeDTO.HighlightDTO;
import br.senac.sp.bookverse.dto.HomeDTO.ProgressDTO;
import br.senac.sp.bookverse.mapper.BookMapper;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.Comment;
import br.senac.sp.bookverse.model.ReadingHistory;
import br.senac.sp.bookverse.model.ReadingStatus;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.BookRepository;
import br.senac.sp.bookverse.repository.CommentRepository;
import br.senac.sp.bookverse.repository.DiscussionRepository;
import br.senac.sp.bookverse.repository.ReadingHistoryRepository;
import br.senac.sp.bookverse.security.CurrentUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class HomeService {

    private static final Logger log = LoggerFactory.getLogger(HomeService.class);

    private final BookRepository bookRepository;
    private final ReadingHistoryRepository readingHistoryRepository;
    private final CurrentUserService currentUserService;
    private final DiscussionRepository discussionRepository;
    private final CommentRepository commentRepository;
    private final br.senac.sp.bookverse.repository.ChapterProgressRepository chapterProgressRepository;
    private final br.senac.sp.bookverse.repository.HighlightLikeRepository highlightLikeRepository;

    public HomeService(
            BookRepository bookRepository,
            ReadingHistoryRepository readingHistoryRepository,
            CurrentUserService currentUserService,
            DiscussionRepository discussionRepository,
            CommentRepository commentRepository,
            br.senac.sp.bookverse.repository.ChapterProgressRepository chapterProgressRepository,
            br.senac.sp.bookverse.repository.HighlightLikeRepository highlightLikeRepository
    ) {
        this.bookRepository = bookRepository;
        this.readingHistoryRepository = readingHistoryRepository;
        this.currentUserService = currentUserService;
        this.discussionRepository = discussionRepository;
        this.commentRepository = commentRepository;
        this.chapterProgressRepository = chapterProgressRepository;
        this.highlightLikeRepository = highlightLikeRepository;
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
        var livroDoMesDTO = livroDoMes.map(BookMapper::toDTO).orElse(null);

        List<ReadingHistory> historicoLeitura = usuarioAtual != null
                ? readingHistoryRepository.findByUsuarioId(usuarioAtual.getId())
                : List.of();

        ProgressDTO progress = calcularProgresso(historicoLeitura, usuarioAtual);
        List<ChapterDTO> chapters = gerarCapitulos(livroDoMesDTO, usuarioAtual);
        List<HighlightDTO> highlights = gerarHighlights(livroDoMesDTO, usuarioAtual);

        HomeDTO home = new HomeDTO(
            livroDoMesDTO,
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

        Optional<Book> livroDoMes = bookRepository.findByDestaqueTrue().stream().findFirst();
        ReadingHistory historicoUsuario = null;
        if (livroDoMes.isPresent()) {
            historicoUsuario = readingHistoryRepository.findByUsuarioAndLivro(usuario, livroDoMes.get())
                .orElseGet(() -> historicos.stream()
                    .filter(h -> h.getUsuario() != null
                        && h.getUsuario().getId() != null
                        && h.getUsuario().getId().equals(usuario.getId())
                        && h.getLivro() != null
                        && h.getLivro().getId() != null
                        && h.getLivro().getId().equals(livroDoMes.get().getId()))
                    .findFirst()
                    .orElse(null));
        }

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

    private List<ChapterDTO> gerarCapitulos(br.senac.sp.bookverse.dto.BookDTO livroDoMes, User usuario) {
        List<ChapterDTO> chapters = new ArrayList<>();
        if (livroDoMes != null && livroDoMes.chapters() != null && !livroDoMes.chapters().isEmpty()) {
            // if user is authenticated, load persisted chapter progress for this book
            java.util.Map<Integer, String> persisted = new java.util.HashMap<>();
            if (usuario != null) {
                Optional<Book> livroEntity = Optional.empty();
                Long bookId = livroDoMes.id();
                if (bookId != null) {
                    livroEntity = bookRepository.findById(bookId);
                }
                if (livroEntity.isPresent()) {
                    var progresses = chapterProgressRepository.findByUsuarioAndLivro(usuario, livroEntity.get());
                    for (var p : progresses) {
                        if (p.getChapterOrder() != null && p.getStatus() != null) {
                            persisted.put(p.getChapterOrder(), p.getStatus());
                        }
                    }
                }
            }

            for (int i = 0; i < livroDoMes.chapters().size(); i++) {
                var chapter = livroDoMes.chapters().get(i);
                Long id = chapter.id() != null ? chapter.id() : (long) (i + 1);
                Integer order = id.intValue();
                String status = persisted.getOrDefault(order, "");
                String state = "active"; // all unlocked by requirement

                chapters.add(new ChapterDTO(id, chapter.title(), status, state));
            }
            return chapters;
        }

        // fallback: generate empty chapters with no status
        for (int i = 1; i <= 5; i++) {
            chapters.add(new ChapterDTO((long) i, "Capítulo " + i, "", "active"));
        }
        return chapters;
    }

    private List<HighlightDTO> gerarHighlights(br.senac.sp.bookverse.dto.BookDTO livroDoMes, User usuarioAtual) {
        if (livroDoMes == null || livroDoMes.id() == null) {
            return List.of();
        }

        List<Comment> comments = discussionRepository.findByLivroId(livroDoMes.id()).stream()
                .flatMap(discussion -> commentRepository.findByDiscussaoId(discussion.getId()).stream())
                .sorted(Comparator.comparing(Comment::getData, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(3)
                .toList();

        if (comments.isEmpty()) {
            return List.of();
        }

        List<HighlightDTO> highlights = new ArrayList<>();
        for (Comment comment : comments) {
            Long id = comment.getId();
            long likes = highlightLikeRepository.countByHighlightIdAndLikedTrue(id);
            boolean liked = usuarioAtual != null
                    && highlightLikeRepository.findByHighlightIdAndUsuario(id, usuarioAtual)
                    .map(record -> Boolean.TRUE.equals(record.getLiked()))
                    .orElse(false);

            String author = "Comunidade";
            if (comment.getUsuario() != null && comment.getUsuario().getNome() != null && !comment.getUsuario().getNome().isBlank()) {
                author = comment.getUsuario().getNome();
            }

            highlights.add(new HighlightDTO(
                    id,
                    comment.getConteudo(),
                    author,
                    (int) likes,
                    liked
            ));
        }

        return highlights;
    }

    @Transactional
    public ProgressDTO atualizarProgresso(ProgressDTO progressDTO) {
        log.info("Atualizando progresso de leitura");

        User usuario = currentUserService.authenticatedUser();
        Book livroDoMes = bookRepository.findByDestaqueTrue().stream()
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Livro do mês não encontrado."));

        ReadingHistory historico = readingHistoryRepository
            .findByUsuarioAndLivro(usuario, livroDoMes)
            .orElseGet(ReadingHistory::new);

        historico.setUsuario(usuario);
        historico.setLivro(livroDoMes);
        historico.setProgresso(progressDTO.currentPage() != null ? progressDTO.currentPage() : 0);
        historico.setStatus(progressDTO.currentPage() != null
            && livroDoMes.getPaginas() != null
            && progressDTO.currentPage() >= livroDoMes.getPaginas()
            ? ReadingStatus.COMPLETE
            : ReadingStatus.READING);

        ReadingHistory salvo = readingHistoryRepository.save(historico);

        Integer currentPage = salvo.getProgresso() != null ? salvo.getProgresso() : 0;
        Integer totalPages = livroDoMes.getPaginas() != null ? livroDoMes.getPaginas() : 0;
        Integer weeklyDone = progressDTO.weeklyDone() != null ? progressDTO.weeklyDone() : 0;
        Integer weeklyGoal = progressDTO.weeklyGoal() != null ? progressDTO.weeklyGoal() : 1;

        return new ProgressDTO(currentPage, totalPages, weeklyDone, weeklyGoal);
    }

    @Transactional
    public HighlightDTO toggleHighlightLike(Long highlightId, Boolean liked) {
        log.info("Alternando like do highlight={}, liked={}", highlightId, liked);
        User usuario = currentUserService.authenticatedUser();

        var existing = highlightLikeRepository.findByHighlightIdAndUsuario(highlightId, usuario);
        if (existing.isPresent()) {
            var rec = existing.get();
            rec.setLiked(Boolean.TRUE.equals(liked));
            highlightLikeRepository.save(rec);
        } else {
            var rec = new br.senac.sp.bookverse.model.HighlightLike(highlightId, usuario, Boolean.TRUE.equals(liked));
            highlightLikeRepository.save(rec);
        }

        long count = highlightLikeRepository.countByHighlightIdAndLikedTrue(highlightId);

        String text = "Destaque da comunidade";
        String author = "Comunidade";
        var comment = commentRepository.findById(highlightId);
        if (comment.isPresent()) {
            if (comment.get().getConteudo() != null && !comment.get().getConteudo().isBlank()) {
                text = comment.get().getConteudo();
            }
            if (comment.get().getUsuario() != null
                    && comment.get().getUsuario().getNome() != null
                    && !comment.get().getUsuario().getNome().isBlank()) {
                author = comment.get().getUsuario().getNome();
            }
        }

        return new HighlightDTO(highlightId, text, author, (int) count, Boolean.TRUE.equals(liked));
    }
}