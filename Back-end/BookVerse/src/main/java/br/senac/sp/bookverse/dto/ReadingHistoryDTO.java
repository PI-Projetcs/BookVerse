package br.senac.sp.bookverse.dto;

import br.senac.sp.bookverse.model.ReadingStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ReadingHistoryDTO(
        Long id,
        @NotNull(message = "Status de leitura é obrigatório") ReadingStatus status,
        @NotNull(message = "Progresso é obrigatório")
        @Min(value = 0, message = "Progresso mínimo é 0%")
        @Max(value = 100, message = "Progresso máximo é 100%") Integer progresso,
        @NotNull(message = "ID do livro é obrigatório") Long livroId,
        String livroTitulo,
        Long usuarioId,
        String usuarioNome
) {
}
