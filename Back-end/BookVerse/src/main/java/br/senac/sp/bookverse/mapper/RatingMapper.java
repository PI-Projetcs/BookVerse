package br.senac.sp.bookverse.mapper;

import br.senac.sp.bookverse.dto.RatingDTO;
import br.senac.sp.bookverse.model.Rating;

public final class RatingMapper {

    private RatingMapper() {
    }

    public static RatingDTO toDTO(Rating rating) {
        if (rating == null) {
            return null;
        }
        return new RatingDTO(
            rating.getId(),
            rating.getNota(),
            rating.getDescricao(),
            rating.getLivro() != null ? rating.getLivro().getId() : null,
            rating.getLivro() != null ? rating.getLivro().getTitulo() : null,
            rating.getUsuario() != null ? rating.getUsuario().getId() : null,
            rating.getUsuario() != null ? rating.getUsuario().getNome() : null,
            rating.getStatus(),
            rating.getAdminFeedback(),
            rating.getModeratedAt()
        );
    }
}

