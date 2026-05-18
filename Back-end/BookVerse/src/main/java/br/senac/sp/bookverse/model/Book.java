package br.senac.sp.bookverse.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String autor;
    private String genero;
    private Integer ano;
    private String sinopse;
    private String coverUrl;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String authorBio;
    private Integer paginas;
    private Boolean destaque;
    private Double mediaAvaliacao;
    private LocalDateTime destaqueData;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "book_chapters", joinColumns = @JoinColumn(name = "book_id"))
    @OrderColumn(name = "chapter_order_index")
    private List<BookChapter> capitulos = new ArrayList<>();

    @OneToMany(mappedBy = "livro", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Rating> avaliacoes;

    @OneToMany(mappedBy = "livro", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Discussion> discussoes;

    @OneToMany(mappedBy = "livro", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReadingHistory> historicoLeitura;
}
