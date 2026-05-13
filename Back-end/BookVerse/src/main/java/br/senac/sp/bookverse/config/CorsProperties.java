package br.senac.sp.bookverse.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "bookverse.cors")
public record CorsProperties(
        List<String> allowedOrigins
) {
}

