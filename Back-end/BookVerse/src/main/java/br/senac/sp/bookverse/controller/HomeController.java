package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.HomeDTO;
import br.senac.sp.bookverse.service.HomeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/home", "/home"})
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    @GetMapping
    public ResponseEntity<HomeDTO> obterHome() {
        return ResponseEntity.ok(homeService.obterHome());
    }

    @PutMapping("/progress")
    public ResponseEntity<HomeDTO.ProgressDTO> atualizarProgresso(@RequestBody HomeDTO.ProgressDTO progressDTO) {
        return ResponseEntity.ok(homeService.atualizarProgresso(progressDTO));
    }

    @PostMapping("/highlights/{highlightId}/like")
    public ResponseEntity<HomeDTO.HighlightDTO> toggleHighlightLike(
            @PathVariable Long highlightId,
            @RequestBody java.util.Map<String, Boolean> payload
    ) {
        Boolean liked = payload.getOrDefault("liked", false);
        return ResponseEntity.ok(homeService.toggleHighlightLike(highlightId, liked));
    }
}
