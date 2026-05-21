package br.senac.sp.bookverse.dto;

import br.senac.sp.bookverse.model.CommentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CommentDTO(
	Long id,
	@NotBlank(message = "Conteúdo é obrigatório") String conteudo,
	LocalDateTime data,
	@NotNull(message = "ID da discussão é obrigatório") Long discussaoId,
	String discussaoTitulo,
	Long usuarioId,
	String usuarioNome,
	CommentStatus status,
	String adminFeedback,
	LocalDateTime moderatedAt,
	Integer likes,
	Boolean liked
) {
}
