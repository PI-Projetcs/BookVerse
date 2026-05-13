package br.senac.sp.bookverse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DiscussionDTO(
        Long id,
        @NotBlank(message = "Título é obrigatório") String titulo,
        @NotBlank(message = "Descrição é obrigatória") String descricao,
        @NotNull(message = "ID do livro é obrigatório") Long livroId,
        String livroTitulo
) {
}
