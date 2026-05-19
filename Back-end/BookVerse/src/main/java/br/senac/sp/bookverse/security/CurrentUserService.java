package br.senac.sp.bookverse.security;

import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User authenticatedUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Não autenticado.");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida."));
    }

    public boolean isAdmin(User usuario) {
        return usuario != null && Role.ADMIN.equals(usuario.getRole());
    }

    public boolean canModerate(User usuario) {
        if (usuario == null) {
            return false;
        }

        if (isAdmin(usuario)) {
            return true;
        }

        return "MODERATOR".equalsIgnoreCase(String.valueOf(usuario.getRole()));
    }
}

