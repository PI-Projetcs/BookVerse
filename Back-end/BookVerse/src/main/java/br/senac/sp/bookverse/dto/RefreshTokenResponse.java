package br.senac.sp.bookverse.dto;

public record RefreshTokenResponse(
        String accessToken,
        String refreshToken,
        String tipo
) {
}
