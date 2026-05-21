package br.senac.sp.bookverse.dto;

import br.senac.sp.bookverse.model.RatingStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record RatingDTO(
	Long id,
	@NotNull(message = "Nota é obrigatória")
	@Min(value = 0, message = "Nota mínima é 0")
	@Max(value = 5, message = "Nota máxima é 5") Integer nota,
	@NotBlank(message = "Descrição é obrigatória") String descricao,
	@NotNull(message = "ID do livro é obrigatório") Long livroId,
	String livroTitulo,
	Long usuarioId,
	String usuarioNome,
	RatingStatus status,
	String adminFeedback,
	LocalDateTime moderatedAt
) {
}
