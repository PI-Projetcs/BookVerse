package br.senac.sp.bookverse.dto;

import br.senac.sp.bookverse.model.Role;

public record AuthenticationResponse(
        String accessToken,
        String tipo,
        Long id,
        String nome,
        String email,
        Role role
) {
    public static AuthenticationResponse of(String token, UserResponseDTO usuario) {
        return new AuthenticationResponse(token, "Bearer", usuario.id(), usuario.nome(), usuario.email(), usuario.role());
    }
}
