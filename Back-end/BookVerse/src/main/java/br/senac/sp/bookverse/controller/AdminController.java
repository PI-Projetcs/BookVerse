package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.CommentDTO;
import br.senac.sp.bookverse.dto.DashboardDTO;
import br.senac.sp.bookverse.dto.RatingDTO;
import br.senac.sp.bookverse.dto.UserResponseDTO;
import br.senac.sp.bookverse.service.CommentService;
import br.senac.sp.bookverse.service.DashboardService;
import br.senac.sp.bookverse.service.RatingService;
import br.senac.sp.bookverse.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping({"/api/v1/admin", "/admin"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final DashboardService dashboardService;
    private final CommentService commentService;
    private final RatingService ratingService;
    private final UserService userService;

    public AdminController(DashboardService dashboardService, CommentService commentService, RatingService ratingService, UserService userService) {
        this.dashboardService = dashboardService;
        this.commentService = commentService;
        this.ratingService = ratingService;
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        return ResponseEntity.ok(dashboardService.obterDashboard());
    }

    @GetMapping("/moderation")
    public ResponseEntity<List<ModerationItemResponse>> getModerationItems(
            @RequestParam(required = false, defaultValue = "pending") String status,
            @RequestParam(required = false, defaultValue = "") String query
    ) {
        List<ModerationItemResponse> items = new ArrayList<>();
        commentService.listarParaModeracao(status, query).forEach(dto -> items.add(toModerationItem(dto)));
        ratingService.listarParaModeracao(status, query).forEach(dto -> items.add(toModerationItem(dto)));

        items.sort(Comparator.comparing(ModerationItemResponse::date).reversed());
        return ResponseEntity.ok(items);
    }

    @PostMapping("/users/{id}/promote")
    public ResponseEntity<UserResponseDTO> promoteUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.promoverParaAdmin(id));
    }

    @PostMapping("/moderation/{itemId}/status")
    public ResponseEntity<ModerationItemResponse> updateModerationStatus(
            @PathVariable String itemId,
            @RequestBody ModerationStatusRequest request
    ) {
        String status = request != null ? request.status() : null;

        if (itemId == null || !itemId.contains("-")) {
            throw new ResponseStatusException(BAD_REQUEST, "ID de moderação inválido.");
        }

        String[] parts = itemId.split("-", 2);
        String type = parts[0];
        Long id;
        try {
            id = Long.parseLong(parts[1]);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(BAD_REQUEST, "ID de moderação inválido.");
        }

        if ("comment".equalsIgnoreCase(type)) {
            CommentDTO updated = commentService.atualizarStatusModeracao(id, status);
            return ResponseEntity.ok(toModerationItem(updated));
        }

        if ("rating".equalsIgnoreCase(type)) {
            RatingDTO updated = ratingService.atualizarStatusModeracao(id, status);
            return ResponseEntity.ok(toModerationItem(updated));
        }

        throw new ResponseStatusException(BAD_REQUEST, "Tipo de item de moderação inválido.");
    }

    private ModerationItemResponse toModerationItem(CommentDTO dto) {
        String date = dto.data() != null ? dto.data().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "";
        String status = dto.status() != null ? dto.status().name().toLowerCase() : "pending";
        return new ModerationItemResponse(
                "comment-" + dto.id(),
                "Discussão",
                dto.discussaoTitulo() != null ? dto.discussaoTitulo() : "Discussão",
                dto.usuarioNome() != null ? dto.usuarioNome() : "Leitor(a)",
                date,
                dto.conteudo(),
                "Comentário de discussão",
                status
        );
    }

    private ModerationItemResponse toModerationItem(RatingDTO dto) {
        String status = dto.status() != null ? dto.status().name().toLowerCase() : "pending";
        return new ModerationItemResponse(
                "rating-" + dto.id(),
                dto.livroTitulo() != null ? dto.livroTitulo() : "Livro",
                "Avaliação do livro",
                dto.usuarioNome() != null ? dto.usuarioNome() : "Leitor(a)",
                "",
                dto.descricao(),
                "Comentário em avaliação",
                status
        );
    }

    private record ModerationStatusRequest(String status) {
    }

    private record ModerationItemResponse(
            String id,
            String bookTitle,
            String chapterTitle,
            String author,
            String date,
            String text,
            String reason,
            String status
    ) {
    }
}

