package br.senac.sp.bookverse.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI bookverseOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BookVerse API")
                        .description("API REST do BookVerse com autenticação JWT, cadastro de livros, discussões, comentários, avaliações e histórico de leitura.")
                        .version("v1")
                        .contact(new Contact().name("BookVerse Team")));
    }
}


