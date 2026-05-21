package br.senac.sp.bookverse.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String conteudo;
    private LocalDateTime data;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommentStatus status = CommentStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User usuario;

    @ManyToOne
    @JoinColumn(name = "discussion_id", nullable = false)
    private Discussion discussao;

    @Lob
    @Column(name = "admin_feedback")
    private String adminFeedback;

    @ManyToOne
    @JoinColumn(name = "moderated_by")
    private User moderatedBy;

    private LocalDateTime moderatedAt;
}
