package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.AuthenticationResponse;
import br.senac.sp.bookverse.dto.LoginRequest;
import br.senac.sp.bookverse.dto.RegistrationRequest;
import br.senac.sp.bookverse.dto.UserResponseDTO;
import br.senac.sp.bookverse.service.AuthenticationService;
import br.senac.sp.bookverse.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth", "/auth"})
public class AuthenticationController {

    private final AuthenticationService authService;
    private final UserService userService;

    public AuthenticationController(AuthenticationService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody RegistrationRequest request) {
        UserResponseDTO created = userService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
