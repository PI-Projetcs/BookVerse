package br.senac.sp.bookverse.config;

import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrapConfig {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapConfig.class);

    @Bean
    public CommandLineRunner bootstrapAdminUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${bookverse.bootstrap.admin.enabled:true}") boolean enabled,
            @Value("${bookverse.bootstrap.admin.email:admin@bookverse.com}") String email,
            @Value("${bookverse.bootstrap.admin.name:Administrador}") String name,
            @Value("${bookverse.bootstrap.admin.password:admin123}") String password,
            @Value("${bookverse.bootstrap.admin.sync-credentials:true}") boolean syncCredentials
    ) {
        return args -> {
            if (!enabled) {
                return;
            }

            String normalizedEmail = String.valueOf(email == null ? "" : email).trim().toLowerCase();
            String normalizedName = String.valueOf(name == null ? "" : name).trim();
            String rawPassword = String.valueOf(password == null ? "" : password).trim();

            if (normalizedEmail.isBlank() || rawPassword.isBlank()) {
                log.warn("Bootstrap de admin ignorado: email/senha invalidos.");
                return;
            }

            User admin = userRepository.findByEmail(normalizedEmail).orElseGet(User::new);
            boolean isNew = admin.getId() == null;
            boolean changed = false;

            if (isNew || !normalizedEmail.equalsIgnoreCase(admin.getEmail())) {
                admin.setEmail(normalizedEmail);
                changed = true;
            }

            if (!normalizedName.isBlank() && (isNew || !normalizedName.equals(admin.getNome()))) {
                admin.setNome(normalizedName);
                changed = true;
            }

            if (!Role.ADMIN.equals(admin.getRole())) {
                admin.setRole(Role.ADMIN);
                changed = true;
            }

            boolean shouldSyncPassword = isNew || syncCredentials;
            if (shouldSyncPassword && !passwordEncoder.matches(rawPassword, String.valueOf(admin.getSenha()))) {
                admin.setSenha(passwordEncoder.encode(rawPassword));
                changed = true;
            }

            if (!changed) {
                return;
            }

            userRepository.save(admin);
            if (isNew) {
                log.info("Usuario admin bootstrap criado: {}", normalizedEmail);
            } else {
                log.info("Usuario admin bootstrap atualizado: {}", normalizedEmail);
            }
        };
    }
}
