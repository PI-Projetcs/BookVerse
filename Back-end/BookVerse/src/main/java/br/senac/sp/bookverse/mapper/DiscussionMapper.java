package br.senac.sp.bookverse.mapper;

import br.senac.sp.bookverse.dto.DiscussionDTO;
import br.senac.sp.bookverse.model.Discussion;

public final class DiscussionMapper {

    private DiscussionMapper() {
    }

    public static DiscussionDTO toDTO(Discussion discussion) {
        if (discussion == null) {
            return null;
        }
        return new DiscussionDTO(
                discussion.getId(),
                discussion.getTitulo(),
                discussion.getDescricao(),
                discussion.getLivro() != null ? discussion.getLivro().getId() : null,
                discussion.getLivro() != null ? discussion.getLivro().getTitulo() : null
        );
    }
}

