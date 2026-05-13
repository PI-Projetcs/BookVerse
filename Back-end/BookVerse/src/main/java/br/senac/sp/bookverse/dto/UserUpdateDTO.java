package br.senac.sp.bookverse.dto;

import br.senac.sp.bookverse.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateDTO(
        @Size(max = 120, message = "Nome deve ter no máximo 120 caracteres") String nome,
        @Email(message = "Email deve ser válido") String email,
        @Size(min = 6, max = 120, message = "Senha deve ter entre 6 e 120 caracteres") String senha,
        Role role
) {
}
