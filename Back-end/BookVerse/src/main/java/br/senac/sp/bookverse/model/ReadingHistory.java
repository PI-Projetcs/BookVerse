package br.senac.sp.bookverse.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "reading_history")
public class ReadingHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ReadingStatus status;

    private Integer progresso;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User usuario;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book livro;
}
