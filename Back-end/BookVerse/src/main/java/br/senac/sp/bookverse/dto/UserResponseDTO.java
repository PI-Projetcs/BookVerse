package br.senac.sp.bookverse.dto;

import br.senac.sp.bookverse.model.Role;

public record UserResponseDTO(
        Long id,
        String nome,
        String email,
        Role role,
        String status
) {
}
