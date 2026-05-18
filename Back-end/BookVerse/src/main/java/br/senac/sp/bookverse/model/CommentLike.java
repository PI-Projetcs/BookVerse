package br.senac.sp.bookverse.model;

import jakarta.persistence.*;

@Entity
@Table(name = "comment_like")
public class CommentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "comment_id", nullable = false)
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private User usuario;

    @Column(nullable = false)
    private Boolean liked = Boolean.TRUE;

    public CommentLike() {
    }

    public CommentLike(Long commentId, User usuario, Boolean liked) {
        this.commentId = commentId;
        this.usuario = usuario;
        this.liked = liked;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }

    public User getUsuario() { return usuario; }
    public void setUsuario(User usuario) { this.usuario = usuario; }

    public Boolean getLiked() { return liked; }
    public void setLiked(Boolean liked) { this.liked = liked; }
}
