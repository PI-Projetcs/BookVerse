package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.RatingDTO;
import br.senac.sp.bookverse.service.RatingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/books", "/books"})
public class BookRatingController {

    private final RatingService ratingService;

    public BookRatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping("/{bookId}/ratings")
    public ResponseEntity<Map<String, List<RatingDTO>>> listarPorLivro(@PathVariable Long bookId) {
        return ResponseEntity.ok(Map.of("items", ratingService.listarPorLivro(bookId)));
    }

    @PostMapping("/{bookId}/ratings")
    public ResponseEntity<RatingDTO> criarOuAtualizar(@PathVariable Long bookId, @Valid @RequestBody BookRatingRequest request) {
        return ResponseEntity.ok(ratingService.criarOuAtualizarMinhaAvaliacao(bookId, request.avaliacao(), request.resenha()));
    }

    @PutMapping("/{bookId}/ratings")
    public ResponseEntity<RatingDTO> atualizar(@PathVariable Long bookId, @Valid @RequestBody BookRatingRequest request) {
        return ResponseEntity.ok(ratingService.atualizarMinhaAvaliacao(bookId, request.avaliacao(), request.resenha()));
    }

    @DeleteMapping("/{bookId}/ratings")
    public ResponseEntity<Void> deletar(@PathVariable Long bookId) {
        ratingService.deletarMinhaAvaliacao(bookId);
        return ResponseEntity.noContent().build();
    }

    public record BookRatingRequest(
            @NotNull(message = "Avaliação é obrigatória")
            @Min(value = 1, message = "Avaliação mínima é 1")
            @Max(value = 5, message = "Avaliação máxima é 5")
            Integer avaliacao,
            String resenha
    ) {
        public String resenha() {
            return resenha == null ? "" : resenha.trim();
        }
    }
}
