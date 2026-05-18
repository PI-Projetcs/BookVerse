package br.senac.sp.bookverse.dto;

import br.senac.sp.bookverse.model.Role;

public record AuthenticationResponse(
        String accessToken,
        String refreshToken,
        String tipo,
        Long id,
        String nome,
        String email,
        Role role
) {
    public static AuthenticationResponse of(String accessToken, String refreshToken, UserResponseDTO usuario) {
        return new AuthenticationResponse(accessToken, refreshToken, "Bearer", usuario.id(), usuario.nome(), usuario.email(), usuario.role());
    }
}
