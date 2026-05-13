package br.senac.sp.bookverse.controller;

import br.senac.sp.bookverse.dto.ReadingHistoryDTO;
import br.senac.sp.bookverse.service.ReadingHistoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping({"/api/v1/reading-histories", "/reading-histories"})
public class ReadingHistoryController {

    private final ReadingHistoryService readingHistoryService;

    public ReadingHistoryController(ReadingHistoryService readingHistoryService) {
        this.readingHistoryService = readingHistoryService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReadingHistoryDTO> getReadingHistory(@PathVariable Long id) {
        return ResponseEntity.ok(readingHistoryService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<Page<ReadingHistoryDTO>> getReadingHistories(@PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(readingHistoryService.listarTodos(pageable));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<ReadingHistoryDTO>> getMyReadingHistories(@PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(readingHistoryService.listarDoUserAutenticado(pageable));
    }

    @PostMapping
    public ResponseEntity<ReadingHistoryDTO> createReadingHistory(@Valid @RequestBody ReadingHistoryDTO dto) {
        ReadingHistoryDTO created = readingHistoryService.criar(dto);
        return ResponseEntity.created(
                ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri()
        ).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReadingHistoryDTO> updateReadingHistory(@PathVariable Long id, @Valid @RequestBody ReadingHistoryDTO dto) {
        return ResponseEntity.ok(readingHistoryService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReadingHistory(@PathVariable Long id) {
        readingHistoryService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

