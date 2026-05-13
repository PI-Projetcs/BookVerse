package br.senac.sp.bookverse;

import br.senac.sp.bookverse.config.JwtProperties;
import br.senac.sp.bookverse.config.CorsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class})
public class BookverseApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookverseApplication.class, args);
	}

}
