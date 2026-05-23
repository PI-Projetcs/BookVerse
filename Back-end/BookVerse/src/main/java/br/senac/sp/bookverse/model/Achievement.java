package br.senac.sp.bookverse.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "achievements")
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AchievementCriteriaType criteriaType;

    @Column(nullable = false)
    private Integer targetValue;

    @Column(nullable = false)
    private Boolean ativo = true;

    @ManyToMany(mappedBy = "conquistas")
    private List<User> usuarios;
}
