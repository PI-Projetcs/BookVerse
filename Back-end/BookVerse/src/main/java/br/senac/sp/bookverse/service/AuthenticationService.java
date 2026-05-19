package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.AuthenticationResponse;
import br.senac.sp.bookverse.dto.LoginRequest;
import br.senac.sp.bookverse.dto.RefreshTokenRequest;
import br.senac.sp.bookverse.dto.RefreshTokenResponse;
import br.senac.sp.bookverse.mapper.UserMapper;
import br.senac.sp.bookverse.repository.UserRepository;
import br.senac.sp.bookverse.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

        String accessToken = jwtTokenProvider.criarTokenAcesso(usuario.getEmail(), usuario.getId(), usuario.getRole().name());
        String refreshToken = jwtTokenProvider.criarTokenRefresh(usuario.getEmail(), usuario.getId(), usuario.getRole().name());
        log.info("Login realizado com sucesso. usuarioId={}, email={}", usuario.getId(), usuario.getEmail());
        return AuthenticationResponse.of(accessToken, refreshToken, UserMapper.toResponse(usuario));
    }

    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        String rawRefreshToken = request.refreshToken().trim();
        if (!jwtTokenProvider.tokenRefreshValido(rawRefreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token inválido ou expirado.");
        }

        Claims claims = jwtTokenProvider.claims(rawRefreshToken);
        String email = claims.getSubject();
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token inválido.");
        }

        var usuario = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado."));

        if (Boolean.FALSE.equals(usuario.getAtivo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta bloqueada.");
        }

        String accessToken = jwtTokenProvider.criarTokenAcesso(usuario.getEmail(), usuario.getId(), usuario.getRole().name());
        String refreshToken = jwtTokenProvider.criarTokenRefresh(usuario.getEmail(), usuario.getId(), usuario.getRole().name());

        return new RefreshTokenResponse(accessToken, refreshToken, "Bearer");
    }
}
