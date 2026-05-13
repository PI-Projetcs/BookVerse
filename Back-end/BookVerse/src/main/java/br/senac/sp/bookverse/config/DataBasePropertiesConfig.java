package br.senac.sp.bookverse.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "spring.datasource")
public class DataBasePropertiesConfig {
    private String url;
    private String username;
    private String password;
    private String driverClassName;
}
