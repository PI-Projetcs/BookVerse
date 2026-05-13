package br.senac.sp.bookverse.mapper;

import br.senac.sp.bookverse.dto.BookDTO;
import br.senac.sp.bookverse.model.Book;

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
                book.getMediaAvaliacao()
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
    }
}