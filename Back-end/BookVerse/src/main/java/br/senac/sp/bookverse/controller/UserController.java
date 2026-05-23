package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.BookDTO;
import br.senac.sp.bookverse.dto.PerfilUsuarioDTO;
import br.senac.sp.bookverse.dto.AchievementDTO;
import br.senac.sp.bookverse.dto.RatingDTO;
import br.senac.sp.bookverse.dto.ReadingHistoryDTO;
import br.senac.sp.bookverse.dto.UserUpdateDTO;
import br.senac.sp.bookverse.dto.UserResponseDTO;
import br.senac.sp.bookverse.dto.UserStatusUpdateDTO;
import br.senac.sp.bookverse.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/users", "/api/users", "/users"})
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> profile() {
        return ResponseEntity.ok(userService.perfilAutenticado());
    }

    @GetMapping("/me/profile")
    public ResponseEntity<PerfilUsuarioDTO> detailedProfile() {
        return ResponseEntity.ok(userService.perfilDetalhadoAutenticado());
    }

    @GetMapping("/{id:\\d+}/profile")
    public ResponseEntity<PerfilUsuarioDTO> profileById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.perfilDetalhadoPorId(id));
    }

    @GetMapping("/me/favorites")
    public ResponseEntity<java.util.List<BookDTO>> myFavorites() {
        return ResponseEntity.ok(userService.listarFavoritosAutenticado());
    }

    @GetMapping("/me/read-books")
    public ResponseEntity<java.util.List<ReadingHistoryDTO>> myReadBooks() {
        return ResponseEntity.ok(userService.meusLivrosLidos());
    }

    @GetMapping("/me/ratings")
    public ResponseEntity<java.util.List<RatingDTO>> myRatings() {
        return ResponseEntity.ok(userService.minhasAvaliacoes());
    }

    @GetMapping("/me/achievements")
    public ResponseEntity<java.util.List<AchievementDTO>> myAchievements() {
        return ResponseEntity.ok(userService.minhasConquistas());
    }

    @GetMapping("/{id:\\d+}/read-books")
    public ResponseEntity<java.util.List<ReadingHistoryDTO>> readBooksById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.livrosLidosPorId(id));
    }

    @GetMapping("/{id:\\d+}/ratings")
    public ResponseEntity<java.util.List<RatingDTO>> ratingsById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.avaliacoesPorId(id));
    }

    @GetMapping("/{id:\\d+}/achievements")
    public ResponseEntity<java.util.List<AchievementDTO>> achievementsById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.conquistasPorId(id));
    }

    @PostMapping("/me/favorites/{bookId:\\d+}")
    public ResponseEntity<PerfilUsuarioDTO> addFavorite(@PathVariable Long bookId) {
        return ResponseEntity.ok(userService.adicionarFavorito(bookId));
    }

    @DeleteMapping("/me/favorites/{bookId:\\d+}")
    public ResponseEntity<PerfilUsuarioDTO> removeFavorite(@PathVariable Long bookId) {
        return ResponseEntity.ok(userService.removerFavorito(bookId));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteOwnAccount() {
        userService.autoExcluirConta();
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> list(@PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(userService.listarTodos(pageable));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.buscarPorId(id));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<UserResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDTO dto
    ) {
        return ResponseEntity.ok(userService.atualizar(id, dto));
    }

    @PutMapping("/{id:\\d+}/status")
    public ResponseEntity<UserResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateDTO dto
    ) {
        return ResponseEntity.ok(userService.atualizarStatus(id, dto));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

