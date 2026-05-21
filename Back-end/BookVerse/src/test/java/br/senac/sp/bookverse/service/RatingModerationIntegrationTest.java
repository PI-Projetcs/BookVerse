package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.Rating;
import br.senac.sp.bookverse.model.RatingStatus;
import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.BookRepository;
import br.senac.sp.bookverse.repository.RatingRepository;
import br.senac.sp.bookverse.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@Transactional
public class RatingModerationIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private RatingService ratingService;

    @AfterEach
    public void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void approvingRatingUpdatesBookAverage() {
        User admin = new User();
        admin.setNome("Admin");
        admin.setEmail("admin2@example.com");
        admin.setSenha("x");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        User u1 = new User();
        u1.setNome("User1");
        u1.setEmail("u1@example.com");
        u1.setSenha("x");
        u1.setRole(Role.USER);
        userRepository.save(u1);

        User u2 = new User();
        u2.setNome("User2");
        u2.setEmail("u2@example.com");
        u2.setSenha("x");
        u2.setRole(Role.USER);
        userRepository.save(u2);

        Book book = new Book();
        book.setTitulo("Rating Book");
        bookRepository.save(book);

        Rating r1 = new Rating();
        r1.setNota(5);
        r1.setDescricao("Nice");
        r1.setStatus(RatingStatus.PENDING);
        r1.setUsuario(u1);
        r1.setLivro(book);
        ratingRepository.save(r1);

        Rating r2 = new Rating();
        r2.setNota(3);
        r2.setDescricao("Ok");
        r2.setStatus(RatingStatus.PENDING);
        r2.setUsuario(u2);
        r2.setLivro(book);
        ratingRepository.save(r2);

        // admin approves r1
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(admin.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
        );

        ratingService.approveRating(r1.getId());

        // After approving r1, average should be 5 (only approved ratings counted)
        var reloadedBook = bookRepository.findById(book.getId()).orElseThrow();
        Assertions.assertEquals(5.0, reloadedBook.getMediaAvaliacao());

        // now approve r2
        ratingService.approveRating(r2.getId());
        var reloadedBook2 = bookRepository.findById(book.getId()).orElseThrow();
        // average (5 + 3) / 2 = 4.0
        Assertions.assertEquals(4.0, reloadedBook2.getMediaAvaliacao());
    }
}
