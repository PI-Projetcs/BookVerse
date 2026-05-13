package br.senac.sp.bookverse.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
@Builder
public class ApiErro {
    private HttpStatus status;
    private String mensagem;
    private String exception;
}
