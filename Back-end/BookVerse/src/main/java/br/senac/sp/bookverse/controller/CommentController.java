package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.CommentDTO;
import br.senac.sp.bookverse.service.CommentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping({"/api/v1/comments", "/comments"})
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getComment(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<Page<CommentDTO>> getComments(@PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(commentService.listarTodos(pageable));
    }

    @PostMapping
    public ResponseEntity<CommentDTO> criarComment(@Valid @RequestBody CommentDTO comentario) {
        CommentDTO criado = commentService.criar(comentario);
        return ResponseEntity.created(
                ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(criado.id()).toUri()
        ).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> atualizarComment(@PathVariable Long id, @Valid @RequestBody CommentDTO comentario) {
        return ResponseEntity.ok(commentService.atualizar(id, comentario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarComment(@PathVariable Long id) {
        commentService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

