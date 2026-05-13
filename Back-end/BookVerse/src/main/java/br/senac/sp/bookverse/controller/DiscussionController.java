package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.DiscussionDTO;
import br.senac.sp.bookverse.service.DiscussionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping({"/api/v1/discussions", "/discussions"})
public class DiscussionController {

    private final DiscussionService discussionService;

    public DiscussionController(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiscussionDTO> getDiscussion(@PathVariable Long id) {
        return ResponseEntity.ok(discussionService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<Page<DiscussionDTO>> getDiscussions(@PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(discussionService.listarTodas(pageable));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<Page<DiscussionDTO>> getDiscussionsByBook(@PathVariable Long bookId, @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(discussionService.listarPorBook(bookId, pageable));
    }

    @PostMapping
    public ResponseEntity<DiscussionDTO> createDiscussion(@Valid @RequestBody DiscussionDTO discussion) {
        DiscussionDTO created = discussionService.criar(discussion);
        return ResponseEntity.created(
                ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri()
        ).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscussionDTO> updateDiscussion(@PathVariable Long id, @Valid @RequestBody DiscussionDTO discussion) {
        return ResponseEntity.ok(discussionService.atualizar(id, discussion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscussion(@PathVariable Long id) {
        discussionService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

