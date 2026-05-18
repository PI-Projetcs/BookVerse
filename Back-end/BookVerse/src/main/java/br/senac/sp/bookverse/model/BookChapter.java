package br.senac.sp.bookverse.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Data
@Embeddable
public class BookChapter {

    @Column(name = "chapter_order")
    private Integer ordem;

    @Column(name = "chapter_title")
    private String titulo;
}