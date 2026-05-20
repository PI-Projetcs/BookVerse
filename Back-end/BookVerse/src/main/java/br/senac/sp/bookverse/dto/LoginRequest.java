package br.senac.sp.bookverse.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record LoginRequest(
        @NotBlank(message = "Email é obrigatório")
        @Email(message = "Email deve ser válido")
        @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "Formato de email inválido") String email,
        @NotBlank(message = "Senha é obrigatória")
        @Pattern(regexp = "^[\\x21-\\x7E]+$", message = "Senha contém caracteres inválidos") String senha
) {
}
