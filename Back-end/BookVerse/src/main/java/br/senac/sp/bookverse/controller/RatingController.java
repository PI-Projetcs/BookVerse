package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.RatingDTO;
import br.senac.sp.bookverse.service.RatingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping({"/api/v1/ratings", "/ratings"})
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<RatingDTO> getRating(@PathVariable Long id) {
        return ResponseEntity.ok(ratingService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<Page<RatingDTO>> getAvaliacoes(@PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(ratingService.listarTodas(pageable));
    }

    @PostMapping
    public ResponseEntity<RatingDTO> criarRating(@Valid @RequestBody RatingDTO avaliacao) {
        RatingDTO criado = ratingService.criar(avaliacao);
        return ResponseEntity.created(
                ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(criado.id()).toUri()
        ).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RatingDTO> atualizarRating(@PathVariable Long id, @Valid @RequestBody RatingDTO avaliacao) {
        return ResponseEntity.ok(ratingService.atualizar(id, avaliacao));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarRating(@PathVariable Long id) {
        ratingService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

