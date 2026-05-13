package br.senac.sp.bookverse.dto;

import jakarta.validation.constraints.NotBlank;

public record AchievementDTO(
        Long id,
        @NotBlank(message = "Nome da conquista é obrigatório") String nome,
        @NotBlank(message = "Descrição da conquista é obrigatória") String descricao
) {
}
