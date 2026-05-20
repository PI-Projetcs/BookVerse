package br.senac.sp.bookverse.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistrationRequest(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 120, message = "Nome deve ter no máximo 120 caracteres") String nome,
        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email deve ser válido")
        @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Formato de email inválido") String email,
        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 6, max = 120, message = "Senha deve ter entre 6 e 120 caracteres")
        @Pattern(regexp = "^[\\x21-\\x7E]+$", message = "Senha contém caracteres inválidos") String senha
) {
}
