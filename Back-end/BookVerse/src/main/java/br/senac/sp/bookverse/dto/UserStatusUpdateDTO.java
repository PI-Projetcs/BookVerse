package br.senac.sp.bookverse.dto;

import jakarta.validation.constraints.NotBlank;

public record UserStatusUpdateDTO(
        @NotBlank(message = "Status é obrigatório")
        String status
) {
}
