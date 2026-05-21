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
@RequestMapping({"/api/v1/admin/moderation", "/admin/moderation"})
public class AdminModerationController {

    private final CommentService commentService;
    private final RatingService ratingService;

    public AdminModerationController(CommentService commentService, RatingService ratingService) {
        this.commentService = commentService;
        this.ratingService = ratingService;
    }

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
        // Build a combined list of comment moderation items. Ratings moderation can be added similarly.
        var comments = commentRepository.findAll();
        var filtered = comments.stream()
                .filter(c -> {
                    if (status == null || status.isBlank() || "all".equalsIgnoreCase(status)) return true;
                    return c.getStatus() != null && c.getStatus().name().equalsIgnoreCase(status);
                })
                .filter(c -> {
                    if (query == null || query.isBlank()) return true;
                    String q = query.trim().toLowerCase();
                    String author = c.getUsuario() != null ? String.valueOf(c.getUsuario().getNome()) : "";
                    String chapter = c.getDiscussao() != null ? String.valueOf(c.getDiscussao().getTitulo()) : "";
                    String book = (c.getDiscussao() != null && c.getDiscussao().getLivro() != null)
                            ? String.valueOf(c.getDiscussao().getLivro().getTitulo())
                            : "";
                    String content = String.valueOf(c.getConteudo());
                    String searchable = String.join(" ", author, chapter, book, content).toLowerCase();
                    return searchable.contains(q);
                })
                .map(c -> {
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    m.put("id", c.getId());
                    m.put("bookTitle", c.getDiscussao() != null && c.getDiscussao().getLivro() != null ? c.getDiscussao().getLivro().getTitulo() : null);
                    m.put("chapterTitle", c.getDiscussao() != null ? c.getDiscussao().getTitulo() : null);
                    m.put("author", c.getUsuario() != null ? c.getUsuario().getNome() : null);
                    m.put("date", c.getData());
                    m.put("text", c.getConteudo());
                    m.put("reason", c.getConteudo() != null && c.getConteudo().length() > 120 ? c.getConteudo().substring(0, 120) : c.getConteudo());
                    m.put("status", c.getStatus() != null ? c.getStatus().name().toLowerCase() : "pending");
                    return m;
                })
                .toList();

        return ResponseEntity.ok(filtered);
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
