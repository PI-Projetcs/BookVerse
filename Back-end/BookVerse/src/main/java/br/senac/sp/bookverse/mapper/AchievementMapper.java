package br.senac.sp.bookverse.mapper;

import br.senac.sp.bookverse.dto.AchievementDTO;
import br.senac.sp.bookverse.model.Achievement;

public final class AchievementMapper {

    private AchievementMapper() {
    }

    public static AchievementDTO toDTO(Achievement achievement) {
        if (achievement == null) {
            return null;
        }
        return new AchievementDTO(
                achievement.getId(),
                achievement.getNome(),
                achievement.getDescricao(),
                achievement.getCriteriaType(),
                achievement.getTargetValue(),
                achievement.getAtivo()
        );
    }

    public static Achievement toEntity(AchievementDTO dto) {
        if (dto == null) {
            return null;
        }
        Achievement achievement = new Achievement();
        achievement.setId(dto.id());
        achievement.setNome(dto.nome());
        achievement.setDescricao(dto.descricao());
        achievement.setCriteriaType(dto.criteriaType());
        achievement.setTargetValue(dto.targetValue());
        achievement.setAtivo(dto.ativo() != null ? dto.ativo() : true);
        return achievement;
    }

    public static void updateEntity(Achievement achievement, AchievementDTO dto) {
        if (achievement == null || dto == null) {
            return;
        }
        achievement.setNome(dto.nome());
        achievement.setDescricao(dto.descricao());
        achievement.setCriteriaType(dto.criteriaType());
        achievement.setTargetValue(dto.targetValue());
        achievement.setAtivo(dto.ativo() != null ? dto.ativo() : achievement.getAtivo());
    }
}

