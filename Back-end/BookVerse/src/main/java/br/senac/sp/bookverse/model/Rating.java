package br.senac.sp.bookverse.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "ratings")
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer nota;
    private String descricao;

    @Enumerated(EnumType.STRING)
    private RatingStatus status = RatingStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User usuario;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book livro;

    @Lob
    @Column(name = "admin_feedback")
    private String adminFeedback;

    @ManyToOne
    @JoinColumn(name = "moderated_by")
    private User moderatedBy;

    private java.time.LocalDateTime moderatedAt;
}
