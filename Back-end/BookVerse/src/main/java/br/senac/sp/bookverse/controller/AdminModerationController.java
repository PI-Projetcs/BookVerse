package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.CommentDTO;
import br.senac.sp.bookverse.dto.RatingDTO;
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

    private static class RejectRequest {
        @NotBlank
        public String feedback;
    }
}
