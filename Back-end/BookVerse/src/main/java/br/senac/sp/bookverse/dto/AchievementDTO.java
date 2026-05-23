package br.senac.sp.bookverse.dto;

import br.senac.sp.bookverse.model.AchievementCriteriaType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AchievementDTO(
        Long id,
        @NotBlank(message = "Nome da conquista é obrigatório") String nome,
        @NotBlank(message = "Descrição da conquista é obrigatória") String descricao,
        @NotNull(message = "Tipo de critério é obrigatório") AchievementCriteriaType criteriaType,
        @NotNull(message = "Valor-alvo é obrigatório") @Positive(message = "Valor-alvo deve ser maior que zero") Integer targetValue,
        Boolean ativo
) {
}
