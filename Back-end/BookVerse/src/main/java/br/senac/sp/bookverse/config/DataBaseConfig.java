package br.senac.sp.bookverse.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
@EnableConfigurationProperties(DataBasePropertiesConfig.class)
public class DataBaseConfig {
    private final DataBasePropertiesConfig props;

    public DataBaseConfig(DataBasePropertiesConfig props) {
        this.props = props;
    }

    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder.create()
                .url(props.getUrl())
                .username(props.getUsername())
                .password(props.getPassword())
                .driverClassName(props.getDriverClassName())
                .build();
    }
}
