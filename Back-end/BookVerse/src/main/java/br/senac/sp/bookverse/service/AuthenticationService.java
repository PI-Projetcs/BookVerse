package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.AuthenticationResponse;
import br.senac.sp.bookverse.dto.LoginRequest;
import br.senac.sp.bookverse.mapper.UserMapper;
import br.senac.sp.bookverse.repository.UserRepository;
import br.senac.sp.bookverse.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthenticationService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthenticationResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        log.debug("Tentativa de login recebida. email={}", email);
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.senha()));

        var usuario = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Usuário não encontrado após autenticação."));

        String token = jwtTokenProvider.criarToken(usuario.getEmail(), usuario.getId(), usuario.getRole().name());
        log.info("Login realizado com sucesso. usuarioId={}, email={}", usuario.getId(), usuario.getEmail());
        return AuthenticationResponse.of(token, UserMapper.toResponse(usuario));
    }
}
