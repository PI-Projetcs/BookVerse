package br.senac.sp.bookverse.mapper;

import br.senac.sp.bookverse.dto.CommentDTO;
import br.senac.sp.bookverse.model.Comment;

public final class CommentMapper {

    private CommentMapper() {
    }

    public static CommentDTO toDTO(Comment comment) {
        if (comment == null) {
            return null;
        }
        return new CommentDTO(
                comment.getId(),
                comment.getConteudo(),
                comment.getData(),
                comment.getDiscussao() != null ? comment.getDiscussao().getId() : null,
                comment.getDiscussao() != null ? comment.getDiscussao().getTitulo() : null,
                comment.getUsuario() != null ? comment.getUsuario().getId() : null,
                comment.getUsuario() != null ? comment.getUsuario().getNome() : null
        );
    }
}

