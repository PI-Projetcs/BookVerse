package br.senac.sp.bookverse.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "chapter_progress")
public class ChapterProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer chapterOrder;

    private String status;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User usuario;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book livro;
}
