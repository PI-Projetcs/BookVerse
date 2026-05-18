package br.senac.sp.bookverse.model;

import jakarta.persistence.*;

@Entity
@Table(name = "highlight_like")
public class HighlightLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "highlight_id", nullable = false)
    private Long highlightId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private User usuario;

    @Column(nullable = false)
    private Boolean liked = Boolean.TRUE;

    public HighlightLike() {
    }

    public HighlightLike(Long highlightId, User usuario, Boolean liked) {
        this.highlightId = highlightId;
        this.usuario = usuario;
        this.liked = liked;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHighlightId() {
        return highlightId;
    }

    public void setHighlightId(Long highlightId) {
        this.highlightId = highlightId;
    }

    public User getUsuario() {
        return usuario;
    }

    public void setUsuario(User usuario) {
        this.usuario = usuario;
    }

    public Boolean getLiked() {
        return liked;
    }

    public void setLiked(Boolean liked) {
        this.liked = liked;
    }
}
