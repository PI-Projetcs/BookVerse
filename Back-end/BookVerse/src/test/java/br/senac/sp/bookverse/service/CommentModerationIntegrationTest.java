package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.Comment;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.repository.BookRepository;
import br.senac.sp.bookverse.repository.CommentRepository;
import br.senac.sp.bookverse.repository.DiscussionRepository;
import br.senac.sp.bookverse.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class CommentModerationIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private DiscussionRepository discussionRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private CommentService commentService;

    @AfterEach
    public void cleanupSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void adminCanRejectAndApproveComment_and_feedbackIsStored() {
        // create users
        User admin = new User();
        admin.setNome("Admin");
        admin.setEmail("admin@example.com");
        admin.setSenha("x");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        User author = new User();
        author.setNome("Author");
        author.setEmail("author@example.com");
        author.setSenha("x");
        author.setRole(Role.USER);
        userRepository.save(author);

        // create book and discussion
        Book book = new Book();
        book.setTitulo("Test Book");
        bookRepository.save(book);

        var discussion = new br.senac.sp.bookverse.model.Discussion();
        discussion.setTitulo("Cap 1");
        discussion.setLivro(book);
        discussionRepository.save(discussion);

        // create comment
        Comment c = new Comment();
        c.setConteudo("Spam content");
        c.setData(LocalDateTime.now());
        c.setStatus(br.senac.sp.bookverse.model.CommentStatus.PENDING);
        c.setUsuario(author);
        c.setDiscussao(discussion);
        commentRepository.save(c);

        // set security context as admin
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(admin.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
        );

        // reject
        var rejected = commentService.rejectComment(c.getId(), "Inappropriate language");
        Assertions.assertEquals(br.senac.sp.bookverse.model.CommentStatus.REJECTED, rejected.status());

        // reload entity and assert feedback
        var reloaded = commentRepository.findById(c.getId()).orElseThrow();
        Assertions.assertEquals("Inappropriate language", reloaded.getAdminFeedback());
        Assertions.assertNotNull(reloaded.getModeratedAt());
        Assertions.assertNotNull(reloaded.getModeratedBy());

        // approve it back
        var approved = commentService.approveComment(c.getId());
        Assertions.assertEquals(br.senac.sp.bookverse.model.CommentStatus.APPROVED, approved.status());
        var reloaded2 = commentRepository.findById(c.getId()).orElseThrow();
        Assertions.assertEquals(br.senac.sp.bookverse.model.CommentStatus.APPROVED, reloaded2.getStatus());
    }
}
