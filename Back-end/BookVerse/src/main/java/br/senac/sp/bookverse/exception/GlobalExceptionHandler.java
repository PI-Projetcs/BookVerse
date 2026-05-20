package br.senac.sp.bookverse.exception;

import br.senac.sp.bookverse.model.ApiErro;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErro> credenciaisInvalidas(BadCredentialsException e) {
        String msg = e.getMessage() != null && !e.getMessage().isBlank() ? e.getMessage() : "Email ou senha incorretos.";
        ApiErro apiErro = ApiErro.builder()
            .status(HttpStatus.UNAUTHORIZED)
            .mensagem(msg)
            .exception(BadCredentialsException.class.getName())
            .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(apiErro);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiErro> contaBloqueada() {
        ApiErro apiErro = ApiErro.builder()
                .status(HttpStatus.FORBIDDEN)
                .mensagem("Conta excluída. Entre em contato com o administrador.")
                .exception(DisabledException.class.getName())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(apiErro);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErro> violacaoIntegridade(DataIntegrityViolationException e) {
        ApiErro apiErro = ApiErro.builder()
                .status(HttpStatus.BAD_REQUEST)
                .mensagem("Email já cadastrado ou dados inválidos.")
                .exception(e.getClass().getName())
                .build();
        return ResponseEntity.badRequest().body(apiErro);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErro> validacao(MethodArgumentNotValidException e) {
            String msg = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .orElse("Dados inválidos.");
        ApiErro apiErro = ApiErro.builder()
                .status(HttpStatus.BAD_REQUEST)
                .mensagem(msg)
                .exception(e.getClass().getName())
                .build();
        return ResponseEntity.badRequest().body(apiErro);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErro> naoEncontrado(ResourceNotFoundException e) {
        ApiErro apiErro = ApiErro.builder()
                .status(HttpStatus.NOT_FOUND)
                .mensagem(e.getMessage())
                .exception(e.getClass().getName())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiErro);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErro> status(ResponseStatusException e) {
        HttpStatus status = HttpStatus.valueOf(e.getStatusCode().value());
        ApiErro apiErro = ApiErro.builder()
                .status(status)
                .mensagem(e.getReason() != null ? e.getReason() : status.getReasonPhrase())
                .exception(e.getClass().getName())
                .build();
        return ResponseEntity.status(status).body(apiErro);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErro> handleGenericException(Exception e) {
        log.error("Erro não tratado capturado pelo handler global", e);
        // Em ambiente de desenvolvimento, retorne a mensagem real da exceção
        String mensagemDetalhada = e.getMessage() != null ? e.getMessage() : "Erro interno do servidor. Por favor, tente novamente mais tarde.";
        ApiErro apiErro = ApiErro.builder()
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .mensagem(mensagemDetalhada)
            .exception(e.getClass().getName())
            .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiErro);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErro> recursoNaoEncontrado(NoResourceFoundException e) {
        ApiErro apiErro = ApiErro.builder()
                .status(HttpStatus.NOT_FOUND)
                .mensagem("Rota não encontrada.")
                .exception(e.getClass().getName())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiErro);
    }
}
