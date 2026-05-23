package br.senac.sp.bookverse.model;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
@Setter
@ToString(exclude = {"usuario", "livrosFavoritos"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "perfil_usuario")
public class PerfilUsuario {

    public static final int LIMITE_LIVROS_FAVORITOS = 3;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User usuario;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "perfil_usuario_livros_favoritos",
            joinColumns = @JoinColumn(name = "perfil_usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "book_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"perfil_usuario_id", "book_id"})
    )
    private List<Book> livrosFavoritos = new ArrayList<>();

    public void adicionarFavorito(Book livro) {
        if (livro == null) {
            throw new IllegalArgumentException("Livro é obrigatório para favoritar.");
        }

        if (livrosFavoritos == null) {
            livrosFavoritos = new ArrayList<>();
        }

        boolean jaFavoritado = livrosFavoritos.stream()
                .filter(Objects::nonNull)
                .anyMatch(item -> Objects.equals(item.getId(), livro.getId()));

        if (jaFavoritado) {
            return;
        }

        if (livrosFavoritos.size() >= LIMITE_LIVROS_FAVORITOS) {
            throw new IllegalStateException("O perfil pode ter no máximo 3 livros favoritos.");
        }

        livrosFavoritos.add(livro);
    }

    public void removerFavorito(Book livro) {
        if (livro == null || livrosFavoritos == null) {
            return;
        }

        livrosFavoritos.removeIf(item -> item != null && Objects.equals(item.getId(), livro.getId()));
    }

    public boolean temFavorito(Book livro) {
        if (livro == null || livrosFavoritos == null) {
            return false;
        }

        return livrosFavoritos.stream()
                .filter(Objects::nonNull)
                .anyMatch(item -> Objects.equals(item.getId(), livro.getId()));
    }
}