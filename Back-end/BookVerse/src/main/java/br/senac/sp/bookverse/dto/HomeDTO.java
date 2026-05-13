package br.senac.sp.bookverse.dto;

import java.util.List;

public record HomeDTO(
        BookDTO bookOfMonth,
        ProgressDTO progress,
        List<ChapterDTO> chapters,
        List<HighlightDTO> highlights
) {
    public record ProgressDTO(
            Integer currentPage,
            Integer totalPages,
            Integer weeklyDone,
            Integer weeklyGoal
    ) {}

    public record ChapterDTO(
            Long id,
            String title,
            String status,
            String state
    ) {}

    public record HighlightDTO(
            Long id,
            String text,
            String author,
            Integer likes,
            Boolean liked
    ) {}
}
