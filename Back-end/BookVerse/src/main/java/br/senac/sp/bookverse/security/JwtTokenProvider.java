package br.senac.sp.bookverse.security;

import br.senac.sp.bookverse.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final String TOKEN_TYPE_CLAIM = "tokenType";
    private static final String ACCESS_TOKEN = "access";
    private static final String REFRESH_TOKEN = "refresh";

    private final SecretKey key;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtTokenProvider(JwtProperties properties) {
        byte[] bytes = properties.secret().getBytes(StandardCharsets.UTF_8);
        this.key = Keys.hmacShaKeyFor(bytes);
        this.accessExpirationMs = properties.expirationMs();
        this.refreshExpirationMs = properties.refreshExpirationMs();
    }

    public String criarTokenAcesso(String email, Long userId, String roleName) {
        return criarToken(email, userId, roleName, ACCESS_TOKEN, accessExpirationMs);
    }

    public String criarTokenRefresh(String email, Long userId, String roleName) {
        return criarToken(email, userId, roleName, REFRESH_TOKEN, refreshExpirationMs);
    }

    private String criarToken(String email, Long userId, String roleName, String tokenType, long expirationMs) {
        Date agora = new Date();
        Date expira = new Date(agora.getTime() + expirationMs);
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", roleName)
                .claim(TOKEN_TYPE_CLAIM, tokenType)
                .issuedAt(agora)
                .expiration(expira)
                .signWith(key)
                .compact();
    }

    public boolean tokenAcessoValido(String token) {
        return tokenValido(token, ACCESS_TOKEN);
    }

    public boolean tokenRefreshValido(String token) {
        return tokenValido(token, REFRESH_TOKEN);
    }

    private boolean tokenValido(String token, String expectedType) {
        try {
            Claims claims = claims(token);
            String tokenType = claims.get(TOKEN_TYPE_CLAIM, String.class);
            return expectedType.equals(tokenType);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Claims claims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
