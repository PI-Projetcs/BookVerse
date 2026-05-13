package br.senac.sp.bookverse.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistrationRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 120, message = "Nome deve ter no máximo 120 caracteres") String nome,
        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email deve ser válido") String email,
        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 6, max = 120, message = "Senha deve ter entre 6 e 120 caracteres") String senha
) {
}
