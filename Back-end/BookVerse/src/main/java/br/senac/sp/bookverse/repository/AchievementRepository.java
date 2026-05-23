package br.senac.sp.bookverse.repository;

import br.senac.sp.bookverse.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByNome(String nome);
    List<Achievement> findByAtivoTrue();
}

