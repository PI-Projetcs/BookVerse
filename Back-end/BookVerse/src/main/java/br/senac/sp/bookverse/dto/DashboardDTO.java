package br.senac.sp.bookverse.dto;

public record DashboardDTO(
    Long totalUsuarios,
    Long totalLivros,
    Long totalDiscussoes,
    Long totalComentarios,
    Long totalAvaliacoes,
    Double mediaAvaliacoesGeral,
    String livroDestaqueAtuall
) {}

