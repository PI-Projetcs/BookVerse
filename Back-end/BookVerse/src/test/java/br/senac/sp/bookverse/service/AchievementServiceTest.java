package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.AchievementDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.model.AchievementCriteriaType;
import br.senac.sp.bookverse.model.Achievement;
import br.senac.sp.bookverse.repository.AchievementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AchievementServiceTest {

    @Mock
    private AchievementRepository achievementRepository;

    @InjectMocks
    private AchievementService achievementService;

    @Test
    void criar_deveSalvarAchievement() {
        AchievementDTO dto = new AchievementDTO(
            null,
            "Leitor",
            "Primeiro livro concluído",
            AchievementCriteriaType.READ_BOOKS,
            1,
            null,
            null,
            null,
            null,
            true
        );
        Achievement salva = new Achievement();
        salva.setId(1L);
        salva.setNome(dto.nome());
        salva.setDescricao(dto.descricao());
        when(achievementRepository.findByNome("Leitor")).thenReturn(List.of());
        when(achievementRepository.save(org.mockito.ArgumentMatchers.any(Achievement.class))).thenReturn(salva);

        AchievementDTO resultado = achievementService.criar(dto);

        assertEquals(1L, resultado.id());
        assertEquals("Leitor", resultado.nome());
        verify(achievementRepository).save(org.mockito.ArgumentMatchers.any(Achievement.class));
    }

    @Test
    void criar_deveBloquearNomeDuplicado() {
        Achievement existente = new Achievement();
        existente.setId(1L);
        existente.setNome("Leitor");
        when(achievementRepository.findByNome("Leitor")).thenReturn(List.of(existente));

        assertThrows(ResponseStatusException.class, () -> achievementService.criar(
            new AchievementDTO(
                null,
                "Leitor",
                "Outra",
                AchievementCriteriaType.READ_BOOKS,
                1,
                null,
                null,
                null,
                null,
                true
            )
        ));
    }

    @Test
    void buscarPorId_deveLancarException_quandoNaoExiste() {
        when(achievementRepository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            achievementService.buscarPorId(9L);
        });
    }
}

