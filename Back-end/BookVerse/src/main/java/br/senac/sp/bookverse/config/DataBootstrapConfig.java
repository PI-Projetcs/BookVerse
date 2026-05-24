package br.senac.sp.bookverse.config;

import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.PerfilUsuario;
import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.BookRepository;
import br.senac.sp.bookverse.repository.PerfilUsuarioRepository;
import br.senac.sp.bookverse.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Configuration
public class DataBootstrapConfig {

    private static final Logger log = LoggerFactory.getLogger(DataBootstrapConfig.class);

    @Bean
    ApplicationRunner seedCoreData(
            UserRepository userRepository,
            PerfilUsuarioRepository perfilUsuarioRepository,
            BookRepository bookRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            ensureUser(userRepository, perfilUsuarioRepository, passwordEncoder,
                    "Administrador", "admin@bookverse.com", "admin123", Role.ADMIN);
            ensureUser(userRepository, perfilUsuarioRepository, passwordEncoder,
                    "Usuario", "user@test.com", "user123", Role.USER);

            List<BookSeed> seeds = defaultBooks();
            upsertBooks(bookRepository, seeds);
            ensureFeaturedBook(bookRepository, "Capitaes da areia");
        };
    }

    private void ensureUser(
            UserRepository userRepository,
            PerfilUsuarioRepository perfilUsuarioRepository,
            PasswordEncoder passwordEncoder,
            String nome,
            String email,
            String senha,
            Role role
    ) {
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User novo = new User();
                    novo.setNome(nome);
                    novo.setEmail(email);
                    novo.setSenha(passwordEncoder.encode(senha));
                    novo.setRole(role);
                    novo.setAtivo(true);
                    User criado = userRepository.save(novo);
                    log.info("Bootstrap user created: {}", email);
                    return criado;
                });

        boolean changed = false;
        if (!Boolean.TRUE.equals(user.getAtivo())) {
            user.setAtivo(true);
            changed = true;
        }
        if (user.getRole() != role) {
            user.setRole(role);
            changed = true;
        }
        if (changed) {
            userRepository.save(user);
            log.info("Bootstrap user updated: {}", email);
        }

        if (perfilUsuarioRepository.findByUsuarioId(user.getId()).isEmpty()) {
            PerfilUsuario perfil = new PerfilUsuario();
            perfil.setUsuario(user);
            perfilUsuarioRepository.save(perfil);
        }
    }

    private void upsertBooks(BookRepository bookRepository, List<BookSeed> seeds) {
        List<Book> current = new ArrayList<>(bookRepository.findAll());

        for (BookSeed seed : seeds) {
            Book target = current.stream()
                    .filter(book -> normalize(book.getTitulo()).equals(normalize(seed.titulo)))
                    .findFirst()
                    .orElse(null);

            if (target == null) {
                target = new Book();
            }

            target.setTitulo(seed.titulo);
            target.setAutor(seed.autor);
            target.setGenero(seed.genero);
            target.setSinopse("Livro cadastrado automaticamente via bootstrap: " + seed.titulo);
            target.setCoverUrl(seed.coverUrl);
            target.setPaginas(seed.paginas);
            target.setAtivo(true);
            if (target.getDestaque() == null) {
                target.setDestaque(false);
            }

            Book saved = bookRepository.save(target);
            if (current.stream().noneMatch(b -> b.getId() != null && b.getId().equals(saved.getId()))) {
                current.add(saved);
            }
        }

        log.info("Bootstrap books upsert complete: {} titles", seeds.size());
    }

    private void ensureFeaturedBook(BookRepository bookRepository, String preferredTitle) {
        List<Book> allVisible = bookRepository.findVisibleBooks();
        if (allVisible.isEmpty()) {
            return;
        }

        for (Book book : allVisible) {
            if (Boolean.TRUE.equals(book.getDestaque())) {
                book.setDestaque(false);
                book.setDestaqueData(null);
                bookRepository.save(book);
            }
        }

        Book selected = allVisible.stream()
                .filter(book -> normalize(book.getTitulo()).equals(normalize(preferredTitle)))
                .findFirst()
                .orElseGet(() -> allVisible.stream()
                        .max(Comparator.comparing(Book::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                        .orElse(allVisible.get(0)));

        selected.setDestaque(true);
        selected.setDestaqueData(LocalDateTime.now());
        bookRepository.save(selected);
        log.info("Bootstrap featured book set: {}", selected.getTitulo());
    }

    private String normalize(String input) {
        if (input == null) {
            return "";
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        return normalized.toLowerCase(Locale.ROOT).trim();
    }

    private List<BookSeed> defaultBooks() {
        return List.of(
                new BookSeed("E Assim que Acaba", "Colleen Hoover", "Romance", "https://m.media-amazon.com/images/I/91r5G8RxqfL.jpg?utm_source=chatgpt.com", 368),
                new BookSeed("It: A Coisa", "Stephen King", "Terror", "https://m.media-amazon.com/images/I/91g9Dvtf+jL.jpg?utm_source=chatgpt.com", 1104),
                new BookSeed("Harry Potter e a Pedra Filosofal", "J. K. Rowling", "Fantasia", "https://m.media-amazon.com/images/I/81ibfYk4qmL.jpg?utm_source=chatgpt.com", 264),
                new BookSeed("A Biblioteca da Meia-Noite", "Matt Haig", "Drama", "https://m.media-amazon.com/images/I/81iqH8dpjuL.jpg?utm_source=chatgpt.com", 308),
                new BookSeed("O Poder do Habito", "Charles Duhigg", "Autoajuda", "https://m.media-amazon.com/images/I/815iPX0SgkL.jpg?utm_source=chatgpt.com", 408),
                new BookSeed("Verity", "Colleen Hoover", "Suspense", "https://m.media-amazon.com/images/I/91SDZ2eUj+L.jpg?utm_source=chatgpt.com", 320),
                new BookSeed("O Hobbit", "J. R. R. Tolkien", "Aventura", "https://m.media-amazon.com/images/I/91b0C2YNSrL.jpg?utm_source=chatgpt.com", 336),
                new BookSeed("Steve Jobs", "Walter Isaacson", "Biografia", "https://m.media-amazon.com/images/I/81VStYnDGrL.jpg?utm_source=chatgpt.com", 688),
                new BookSeed("Sapiens", "Yuval Noah Harari", "Historia", "https://m.media-amazon.com/images/I/713jIoMO3UL.jpg?utm_source=chatgpt.com", 472),
                new BookSeed("Turma da Monica", "Mauricio de Sousa", "Infantojuvenil", "https://covers.openlibrary.org/b/olid/OL25882679M-L.jpg", 96),
                new BookSeed("Toda Poesia", "Paulo Leminski", "Poesia", "https://covers.openlibrary.org/b/olid/OL27146459M-L.jpg", 480),
                new BookSeed("A Culpa e das Estrelas", "John Green", "Romance", "https://covers.openlibrary.org/b/olid/OL32036803M-L.jpg", 288),
                new BookSeed("Capitaes da areia", "Jorge Leal Amado de Faria", "Drama", "https://covers.openlibrary.org/b/olid/OL26330623M-L.jpg", 288),
                new BookSeed("Dom Casmurro", "Autor nao informado", "Drama", "https://covers.openlibrary.org/b/olid/OL9157135M-L.jpg", 256),
                new BookSeed("Ostra Feliz Nao Faz Perola", "Rubem Alves", "Autoajuda", "https://covers.openlibrary.org/b/olid/OL35664877M-L.jpg", 176)
        );
    }

    private record BookSeed(String titulo, String autor, String genero, String coverUrl, Integer paginas) {
    }
}
