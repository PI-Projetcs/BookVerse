package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.UserUpdateDTO;
import br.senac.sp.bookverse.dto.UserResponseDTO;
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

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

