package br.senac.sp.bookverse.mapper;

import br.senac.sp.bookverse.dto.BookDTO;
import br.senac.sp.bookverse.model.BookChapter;
import br.senac.sp.bookverse.model.Book;

import java.util.ArrayList;
import java.util.List;

public final class BookMapper {

    private BookMapper() {
        // Utility class
    }

    public static BookDTO toDTO(Book book) {
        if (book == null) {
            return null;
        }

        return new BookDTO(
                book.getId(),
                book.getTitulo(),
                book.getAutor(),
                book.getGenero(),
                book.getAno(),
                book.getSinopse(),
                book.getCoverUrl(),
                book.getPaginas(),
                book.getDestaque(),
                book.getMediaAvaliacao(),
                toChapterDTOs(book.getCapitulos())
        );
    }

    public static Book toEntity(BookDTO dto) {
        if (dto == null) {
            return null;
        }

        Book book = new Book();
        updateEntityFromDto(book, dto);
        return book;
    }

    public static void updateEntityFromDto(Book book, BookDTO dto) {
        if (book == null || dto == null) {
            return;
        }

        book.setTitulo(dto.titulo());
        book.setAutor(dto.autor());
        book.setGenero(dto.genero());
        book.setAno(dto.ano());
        book.setSinopse(dto.sinopse());
        book.setCoverUrl(dto.coverUrl());
        book.setPaginas(dto.paginas());
        book.setDestaque(dto.destaque());
        book.setMediaAvaliacao(dto.mediaAvaliacao());
        book.setCapitulos(toEntityChapters(dto.chapters()));
    }

    private static List<BookDTO.ChapterDTO> toChapterDTOs(List<BookChapter> chapters) {
        if (chapters == null) {
            return new ArrayList<>();
        }

        List<BookDTO.ChapterDTO> result = new ArrayList<>();
        for (int i = 0; i < chapters.size(); i++) {
            BookChapter chapter = chapters.get(i);
            if (chapter == null) {
                continue;
            }

            result.add(new BookDTO.ChapterDTO(
                    chapter.getOrdem() != null ? chapter.getOrdem().longValue() : (long) (i + 1),
                    chapter.getTitulo()
            ));
        }

        return result;
    }

    private static List<BookChapter> toEntityChapters(List<BookDTO.ChapterDTO> chapters) {
        if (chapters == null) {
            return new ArrayList<>();
        }

        List<BookChapter> result = new ArrayList<>();
        for (int i = 0; i < chapters.size(); i++) {
            BookDTO.ChapterDTO chapter = chapters.get(i);
            if (chapter == null || chapter.title() == null || chapter.title().trim().isEmpty()) {
                continue;
            }

            BookChapter entity = new BookChapter();
            entity.setOrdem(chapter.id() != null ? chapter.id().intValue() : i + 1);
            entity.setTitulo(chapter.title().trim());
            result.add(entity);
        }

        return result;
    }
}