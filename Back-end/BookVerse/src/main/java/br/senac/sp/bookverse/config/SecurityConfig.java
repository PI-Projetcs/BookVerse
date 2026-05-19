package br.senac.sp.bookverse.config;

import br.senac.sp.bookverse.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsProperties corsProperties;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, CorsProperties corsProperties) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsProperties = corsProperties;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/auth/**", "/api/v1/auth/**", "/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/home", "/api/v1/home").permitAll()
                .requestMatchers(HttpMethod.GET, "/books", "/api/v1/books").permitAll()
                .requestMatchers(HttpMethod.GET, "/books/**", "/api/v1/books/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/discussions", "/api/v1/discussions").permitAll()
                .requestMatchers(HttpMethod.GET, "/discussions/**", "/api/v1/discussions/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/comments/discussion/**", "/api/v1/comments/discussion/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/users/me", "/api/v1/users/me").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/users/me", "/api/v1/users/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/users", "/api/v1/users").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/users/**", "/api/v1/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/users/**", "/api/v1/users/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/users/**", "/api/v1/users/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/admin/dashboard", "/api/v1/admin/dashboard").hasRole("ADMIN")
                .requestMatchers("/admin/moderation/**", "/api/v1/admin/moderation/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/books/*/set-book-of-month", "/api/v1/books/*/set-book-of-month").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(corsProperties.allowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        config.setExposedHeaders(List.of(HttpHeaders.AUTHORIZATION));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
