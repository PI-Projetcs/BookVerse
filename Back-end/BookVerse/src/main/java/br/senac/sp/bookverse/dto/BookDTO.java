package br.senac.sp.bookverse.dto;

import jakarta.validation.constraints.*;

import java.util.List;

public record BookDTO(
        Long id,
        @NotBlank(message = "Título é obrigatório") String titulo,
        @NotBlank(message = "Autor é obrigatório") String autor,
        String genero,
        @Min(value = 1900, message = "Ano deve ser maior que 1900")
        @Max(value = 2100, message = "Ano deve ser menor que 2100") Integer ano,
        String sinopse,
        String coverUrl,
        @Size(max = 4000, message = "Sobre o autor deve ter no máximo 4000 caracteres")
        String authorBio,
        Integer paginas,
        Boolean ativo,
        Boolean destaque,
        @Min(value = 0, message = "Avaliação mínima é 0")
        @Max(value = 5, message = "Avaliação máxima é 5") Double mediaAvaliacao,
        List<ChapterDTO> chapters
) {
        public BookDTO(Long id, String titulo, String autor, String genero, Integer ano, String sinopse, String coverUrl, String authorBio, Boolean destaque, Double mediaAvaliacao) {
                this(id, titulo, autor, genero, ano, sinopse, coverUrl, authorBio, null, true, destaque, mediaAvaliacao, List.of());
        }

        public BookDTO(Long id, String titulo, String autor, String genero, Integer ano, String sinopse, String coverUrl, String authorBio, Integer paginas, Boolean destaque, Double mediaAvaliacao) {
                this(id, titulo, autor, genero, ano, sinopse, coverUrl, authorBio, paginas, true, destaque, mediaAvaliacao, List.of());
        }

        public BookDTO(Long id, String titulo, String autor, String genero, Integer ano, String sinopse, String coverUrl, String authorBio, Boolean ativo, Boolean destaque, Double mediaAvaliacao) {
                this(id, titulo, autor, genero, ano, sinopse, coverUrl, authorBio, null, ativo, destaque, mediaAvaliacao, List.of());
        }

        public BookDTO(Long id, String titulo, String autor, String genero, Integer ano, String sinopse, String coverUrl, String authorBio, Integer paginas, Boolean ativo, Boolean destaque, Double mediaAvaliacao) {
                this(id, titulo, autor, genero, ano, sinopse, coverUrl, authorBio, paginas, ativo, destaque, mediaAvaliacao, List.of());
        }

    public record ChapterDTO(
            Long id,
            String title
    ) {}
}
