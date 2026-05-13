package br.senac.sp.bookverse.dto;

import jakarta.validation.constraints.*;

public record BookDTO(
        Long id,
        @NotBlank(message = "Título é obrigatório") String titulo,
        @NotBlank(message = "Autor é obrigatório") String autor,
        String genero,
        @Min(value = 1900, message = "Ano deve ser maior que 1900")
        @Max(value = 2100, message = "Ano deve ser menor que 2100") Integer ano,
        String sinopse,
        String coverUrl,
        Integer paginas,
        Boolean destaque,
        @Min(value = 0, message = "Avaliação mínima é 0")
        @Max(value = 5, message = "Avaliação máxima é 5") Double mediaAvaliacao
) {
}
