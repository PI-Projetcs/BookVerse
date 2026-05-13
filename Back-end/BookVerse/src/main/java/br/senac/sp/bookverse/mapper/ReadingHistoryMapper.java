package br.senac.sp.bookverse.mapper;

import br.senac.sp.bookverse.dto.ReadingHistoryDTO;
import br.senac.sp.bookverse.model.ReadingHistory;

public final class ReadingHistoryMapper {

    private ReadingHistoryMapper() {
    }

    public static ReadingHistoryDTO toDTO(ReadingHistory readingHistory) {
        if (readingHistory == null) {
            return null;
        }
        return new ReadingHistoryDTO(
                readingHistory.getId(),
                readingHistory.getStatus(),
                readingHistory.getProgresso(),
                readingHistory.getLivro() != null ? readingHistory.getLivro().getId() : null,
                readingHistory.getLivro() != null ? readingHistory.getLivro().getTitulo() : null,
                readingHistory.getUsuario() != null ? readingHistory.getUsuario().getId() : null,
                readingHistory.getUsuario() != null ? readingHistory.getUsuario().getNome() : null
        );
    }
}

