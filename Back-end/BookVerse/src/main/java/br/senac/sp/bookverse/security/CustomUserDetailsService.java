package br.senac.sp.bookverse.security;

import br.senac.sp.bookverse.repository.UserRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String normalizado = email == null ? "" : email.trim().toLowerCase();
        var usuario = userRepository.findByEmail(normalizado)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + normalizado));

        return org.springframework.security.core.userdetails.User.builder()
                .username(usuario.getEmail())
                .password(usuario.getSenha())
            .disabled(Boolean.FALSE.equals(usuario.getAtivo()))
                .roles(usuario.getRole().name())
                .build();
    }
}
