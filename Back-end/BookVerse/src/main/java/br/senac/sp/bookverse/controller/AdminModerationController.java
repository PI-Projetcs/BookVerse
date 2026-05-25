package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.CommentDTO;
import br.senac.sp.bookverse.dto.RatingDTO;
import br.senac.sp.bookverse.model.Comment;
import br.senac.sp.bookverse.repository.CommentRepository;
import br.senac.sp.bookverse.service.CommentService;
import br.senac.sp.bookverse.service.RatingService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/admin/comments-moderation", "/admin/comments-moderation"})
public class AdminModerationController {

    private final CommentService commentService;
    private final RatingService ratingService;
    private final CommentRepository commentRepository;

    public AdminModerationController(CommentService commentService, RatingService ratingService, CommentRepository commentRepository) {
        this.commentService = commentService;
        this.ratingService = ratingService;
        this.commentRepository = commentRepository;
    }

    @PostMapping("/comments/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommentDTO> approveComment(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.approveComment(id));
    }

    @PostMapping("/comments/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommentDTO> rejectComment(@PathVariable Long id, @RequestBody RejectRequest body) {
        return ResponseEntity.ok(commentService.rejectComment(id, body.feedback));
    }

    @PostMapping("/ratings/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RatingDTO> approveRating(@PathVariable Long id) {
        return ResponseEntity.ok(ratingService.approveRating(id));
    }

    @PostMapping("/ratings/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RatingDTO> rejectRating(@PathVariable Long id, @RequestBody RejectRequest body) {
        return ResponseEntity.ok(ratingService.rejectRating(id, body.feedback));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listModerationItems(@RequestParam(required = false) String status, @RequestParam(required = false) String query) {
        // Combine comments and ratings moderation items into a single list for the admin UI.
        var commentItems = commentService.listarParaModeracao(status, query).stream().map(dto -> {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("type", "comment");
            m.put("id", dto.id());
            m.put("bookTitle", dto.discussaoId() != null && dto.discussaoTitulo() != null ? dto.discussaoTitulo() : null);
            m.put("chapterTitle", dto.discussaoTitulo());
            m.put("author", dto.usuarioNome());
            m.put("date", dto.data());
            m.put("text", dto.conteudo());
            m.put("reason", dto.conteudo() != null && dto.conteudo().length() > 120 ? dto.conteudo().substring(0, 120) : dto.conteudo());
            m.put("status", dto.status() != null ? dto.status().name().toLowerCase() : "pending");
            m.put("adminFeedback", dto.adminFeedback());
            return m;
        }).toList();

        var ratingItems = ratingService.listarParaModeracao(status, query).stream().map(dto -> {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put("type", "rating");
            m.put("id", dto.id());
            m.put("bookTitle", dto.livroTitulo());
            m.put("chapterTitle", null);
            m.put("author", dto.usuarioNome());
            m.put("date", dto.moderatedAt());
            m.put("text", dto.descricao());
            m.put("rating", dto.nota());
            m.put("reason", dto.descricao() != null && dto.descricao().length() > 120 ? dto.descricao().substring(0, 120) : dto.descricao());
            m.put("status", dto.status() != null ? dto.status().name().toLowerCase() : "pending");
            m.put("adminFeedback", dto.adminFeedback());
            return m;
        }).toList();

        var combined = new java.util.ArrayList<java.util.Map<String, Object>>();
        combined.addAll(commentItems);
        combined.addAll(ratingItems);

        // Optional: sort combined by date desc
        combined.sort((a, b) -> {
            java.time.LocalDateTime da = (java.time.LocalDateTime) a.get("date");
            java.time.LocalDateTime db = (java.time.LocalDateTime) b.get("date");
            if (da == null && db == null) return 0;
            if (da == null) return 1;
            if (db == null) return -1;
            return db.compareTo(da);
        });

        return ResponseEntity.ok(combined);
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setModerationStatus(@PathVariable Long id, @RequestBody StatusRequest body) {
        String status = body.status;
        var updated = commentService.atualizarStatusModeracao(id, status);
        return ResponseEntity.ok(updated);
    }

    private static class StatusRequest {
        public String status;
    }

    private static class RejectRequest {
        @NotBlank
        public String feedback;
    }
}
