package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.AchievementDTO;
import br.senac.sp.bookverse.service.AchievementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping({"/api/v1/achievements", "/achievements"})
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<AchievementDTO> getAchievement(@PathVariable Long id) {
        return ResponseEntity.ok(achievementService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<Page<AchievementDTO>> getAchievements(@PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(achievementService.listarTodas(pageable));
    }

    @PostMapping
    public ResponseEntity<AchievementDTO> criarAchievement(@Valid @RequestBody AchievementDTO achievement) {
        AchievementDTO created = achievementService.criar(achievement);
        return ResponseEntity.created(
                ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri()
        ).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AchievementDTO> atualizarAchievement(@PathVariable Long id, @Valid @RequestBody AchievementDTO achievement) {
        return ResponseEntity.ok(achievementService.atualizar(id, achievement));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAchievement(@PathVariable Long id) {
        achievementService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

