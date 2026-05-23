package br.senac.sp.bookverse.dto;

import java.util.List;

public record PerfilUsuarioDTO(
        UserResponseDTO usuario,
        List<BookDTO> livrosFavoritos,
        List<ReadingHistoryDTO> livrosLidos,
        List<RatingDTO> avaliacoes,
        List<AchievementDTO> conquistas
) {
}