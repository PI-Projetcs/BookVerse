package br.senac.sp.bookverse.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "discussions")
public class Discussion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book livro;

    @OneToMany(mappedBy = "discussao", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comentarios;
}
