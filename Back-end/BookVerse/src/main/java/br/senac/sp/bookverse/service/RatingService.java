package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.RatingDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.mapper.RatingMapper;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.Rating;
import br.senac.sp.bookverse.model.RatingStatus;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.BookRepository;
import br.senac.sp.bookverse.repository.RatingRepository;
import br.senac.sp.bookverse.security.CurrentUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.StreamSupport;

@Service
public class RatingService {

	private static final Logger log = LoggerFactory.getLogger(RatingService.class);

	private final RatingRepository ratingRepository;
	private final BookRepository bookRepository;
	private final CurrentUserService currentUserService;
	private final AchievementService achievementService;

	public RatingService(
			RatingRepository ratingRepository,
			BookRepository bookRepository,
			CurrentUserService currentUserService,
			AchievementService achievementService
	) {
		this.ratingRepository = ratingRepository;
		this.bookRepository = bookRepository;
		this.currentUserService = currentUserService;
		this.achievementService = achievementService;
	}

	@Transactional(readOnly = true)
	public List<RatingDTO> listarTodas() {
		return StreamSupport.stream(ratingRepository.findAll().spliterator(), false)
				.map(RatingMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public Page<RatingDTO> listarTodas(Pageable pageable) {
		return ratingRepository.findAll(pageable).map(RatingMapper::toDTO);
	}

	@Transactional(readOnly = true)
	public List<RatingDTO> listarPorLivro(Long livroId) {
		validarLivroExiste(livroId);
		User viewer = tryAuthenticatedUser();
		boolean canModerate = currentUserService.canModerate(viewer);
		Long viewerId = viewer != null ? viewer.getId() : null;

		return ratingRepository.findByLivroId(livroId).stream()
				.filter(rating -> {
					if (canModerate) {
						return true;
					}

					if (viewerId != null && rating.getUsuario() != null && viewerId.equals(rating.getUsuario().getId())) {
						return true;
					}

					return isApprovedOrLegacy(rating.getStatus());
				})
				.map(RatingMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<RatingDTO> listarParaModeracao(String statusFilter, String query) {
		RatingStatus status = parseStatus(statusFilter);
		String queryText = String.valueOf(query == null ? "" : query).trim().toLowerCase();

		List<Rating> items = status == null
				? ratingRepository.findAll()
				: ratingRepository.findByStatus(status);

		return items.stream()
				.filter(item -> item.getDescricao() != null && !item.getDescricao().trim().isEmpty())
				.filter(item -> {
					if (queryText.isEmpty()) {
						return true;
					}
					String author = item.getUsuario() != null ? String.valueOf(item.getUsuario().getNome()) : "";
					String book = item.getLivro() != null ? String.valueOf(item.getLivro().getTitulo()) : "";
					String content = String.valueOf(item.getDescricao());
					String searchable = String.join(" ", author, book, content).toLowerCase();
					return searchable.contains(queryText);
				})
				.sorted((left, right) -> Long.compare(right.getId(), left.getId()))
				.map(RatingMapper::toDTO)
				.toList();
	}

	@Transactional
	public RatingDTO atualizarStatusModeracao(Long id, String statusValue) {
		Rating rating = buscarEntidadePorId(id);
		rating.setStatus(parseStatusOrThrow(statusValue));
		Rating saved = ratingRepository.save(rating);
		Long livroId = saved.getLivro() != null ? saved.getLivro().getId() : null;
		if (livroId != null) {
			atualizarMediaAvaliacaoLivro(livroId);
		}
		return RatingMapper.toDTO(saved);
	}

	@Transactional
	public RatingDTO approveRating(Long id) {
		Rating rating = buscarEntidadePorId(id);
		User atual = currentUserService.authenticatedUser();
		if (!currentUserService.isAdmin(atual)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas administrador pode aprovar avaliações.");
		}
		rating.setStatus(RatingStatus.APPROVED);
		rating.setModeratedBy(atual);
		rating.setModeratedAt(java.time.LocalDateTime.now());
		rating.setAdminFeedback(null);
		Rating saved = ratingRepository.save(rating);
		Long livroId = saved.getLivro() != null ? saved.getLivro().getId() : null;
		if (livroId != null) {
			atualizarMediaAvaliacaoLivro(livroId);
		}
		return RatingMapper.toDTO(saved);
	}

	@Transactional
	public RatingDTO rejectRating(Long id, String feedback) {
		Rating rating = buscarEntidadePorId(id);
		User atual = currentUserService.authenticatedUser();
		if (!currentUserService.isAdmin(atual)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas administrador pode rejeitar avaliações.");
		}
		rating.setStatus(RatingStatus.REJECTED);
		rating.setModeratedBy(atual);
		rating.setModeratedAt(java.time.LocalDateTime.now());
		rating.setAdminFeedback(feedback);
		Rating saved = ratingRepository.save(rating);
		Long livroId = saved.getLivro() != null ? saved.getLivro().getId() : null;
		if (livroId != null) {
			atualizarMediaAvaliacaoLivro(livroId);
		}
		return RatingMapper.toDTO(saved);
	}

	@Transactional(readOnly = true)
	public RatingDTO buscarPorId(Long id) {
		return RatingMapper.toDTO(buscarEntidadePorId(id));
	}

	@Transactional
	public RatingDTO criar(RatingDTO dto) {
		User usuario = currentUserService.authenticatedUser();
		Rating avaliacao = new Rating();
		avaliacao.setNota(dto.nota());
		avaliacao.setDescricao(dto.descricao());
		avaliacao.setStatus(resolveStatusForUser(usuario));
		avaliacao.setUsuario(usuario);
		avaliacao.setLivro(bookRepository.findById(dto.livroId())
				.orElseThrow(() -> new ResourceNotFoundException("Book não encontrado.")));
		Rating salva = ratingRepository.save(avaliacao);
		atualizarMediaAvaliacaoLivro(dto.livroId());
		achievementService.avaliarERegistrarConquistasDoUsuario(usuario.getId());
		log.info("Avaliação criada. id={}, usuario={}", salva.getId(), usuario.getId());
		return RatingMapper.toDTO(salva);
	}

	@Transactional
	public RatingDTO criarOuAtualizarMinhaAvaliacao(Long livroId, Integer nota, String descricao) {
		User usuario = currentUserService.authenticatedUser();
		Book livro = buscarLivroPorId(livroId);
		Rating avaliacao = ratingRepository.findByLivroIdAndUsuarioId(livroId, usuario.getId())
				.orElseGet(Rating::new);

		avaliacao.setLivro(livro);
		avaliacao.setUsuario(usuario);
		avaliacao.setNota(nota);
		avaliacao.setDescricao(descricao);
		avaliacao.setStatus(resolveStatusForUser(usuario));

		Rating salva = ratingRepository.save(avaliacao);
		atualizarMediaAvaliacaoLivro(livroId);
		log.info("Avaliação upsert por livro. livroId={}, usuarioId={}, ratingId={}", livroId, usuario.getId(), salva.getId());
		return RatingMapper.toDTO(salva);
	}

	@Transactional
	public RatingDTO atualizarMinhaAvaliacao(Long livroId, Integer nota, String descricao) {
		User usuario = currentUserService.authenticatedUser();
		validarLivroExiste(livroId);
		Rating avaliacao = ratingRepository.findByLivroIdAndUsuarioId(livroId, usuario.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada para este livro."));

		avaliacao.setNota(nota);
		avaliacao.setDescricao(descricao);
		avaliacao.setStatus(resolveStatusForUser(usuario));
		Rating salva = ratingRepository.save(avaliacao);
		atualizarMediaAvaliacaoLivro(livroId);
		achievementService.avaliarERegistrarConquistasDoUsuario(usuario.getId());
		log.info("Avaliação atualizada por livro. livroId={}, usuarioId={}, ratingId={}", livroId, usuario.getId(), salva.getId());
		return RatingMapper.toDTO(salva);
	}

	@Transactional
	public void deletarMinhaAvaliacao(Long livroId) {
		User usuario = currentUserService.authenticatedUser();
		validarLivroExiste(livroId);
		Rating avaliacao = ratingRepository.findByLivroIdAndUsuarioId(livroId, usuario.getId())
				.orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada para este livro."));

		ratingRepository.delete(avaliacao);
		atualizarMediaAvaliacaoLivro(livroId);
		achievementService.avaliarERegistrarConquistasDoUsuario(usuario.getId());
		log.info("Avaliação removida por livro. livroId={}, usuarioId={}, ratingId={}", livroId, usuario.getId(), avaliacao.getId());
	}

	@Transactional
	public RatingDTO atualizar(Long id, RatingDTO dto) {
		Rating avaliacao = buscarEntidadePorId(id);
		Long livroOriginalId = avaliacao.getLivro() != null ? avaliacao.getLivro().getId() : null;
		User atual = currentUserService.authenticatedUser();
		if (!currentUserService.isAdmin(atual) && !avaliacao.getUsuario().getId().equals(atual.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para alterar esta avaliação.");
		}

		avaliacao.setNota(dto.nota());
		avaliacao.setDescricao(dto.descricao());
		avaliacao.setStatus(resolveStatusForUser(atual));
		if (dto.livroId() != null) {
			avaliacao.setLivro(bookRepository.findById(dto.livroId())
					.orElseThrow(() -> new ResourceNotFoundException("Book não encontrado.")));
		}

		Rating salva = ratingRepository.save(avaliacao);
		Long livroAtualId = salva.getLivro() != null ? salva.getLivro().getId() : null;
		if (livroOriginalId != null) {
			atualizarMediaAvaliacaoLivro(livroOriginalId);
		}
		if (livroAtualId != null && (livroOriginalId == null || !livroAtualId.equals(livroOriginalId))) {
			atualizarMediaAvaliacaoLivro(livroAtualId);
		}
		log.info("Avaliação atualizada. id={}", id);
		return RatingMapper.toDTO(salva);
	}

	@Transactional
	public void deletar(Long id) {
		Rating avaliacao = buscarEntidadePorId(id);
		Long livroId = avaliacao.getLivro() != null ? avaliacao.getLivro().getId() : null;
		User atual = currentUserService.authenticatedUser();
		if (!currentUserService.isAdmin(atual) && !avaliacao.getUsuario().getId().equals(atual.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para excluir esta avaliação.");
		}
		ratingRepository.delete(avaliacao);
		if (livroId != null) {
			atualizarMediaAvaliacaoLivro(livroId);
		}
		log.info("Avaliação removida. id={}", id);
	}

	private void validarLivroExiste(Long livroId) {
		buscarLivroPorId(livroId);
	}

	private Book buscarLivroPorId(Long livroId) {
		return bookRepository.findById(livroId)
				.orElseThrow(() -> new ResourceNotFoundException("Book não encontrado."));
	}

	private void atualizarMediaAvaliacaoLivro(Long livroId) {
		Book livro = buscarLivroPorId(livroId);
		double media = ratingRepository.findByLivroId(livroId).stream()
				.filter(rating -> isApprovedOrLegacy(rating.getStatus()))
				.map(Rating::getNota)
				.filter(java.util.Objects::nonNull)
				.mapToInt(Integer::intValue)
				.average()
				.orElse(0.0);
		livro.setMediaAvaliacao(media);
		bookRepository.save(livro);
	}

	private Rating buscarEntidadePorId(Long id) {
		return ratingRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada."));
	}

	private User tryAuthenticatedUser() {
		try {
			return currentUserService.authenticatedUser();
		} catch (Exception e) {
			return null;
		}
	}

	private RatingStatus resolveStatusForUser(User user) {
		if (currentUserService.canModerate(user)) {
			return RatingStatus.APPROVED;
		}
		return RatingStatus.PENDING;
	}

	private boolean isApprovedOrLegacy(RatingStatus status) {
		return status == null || RatingStatus.APPROVED.equals(status);
	}

	private RatingStatus parseStatus(String value) {
		if (value == null || value.trim().isEmpty() || "all".equalsIgnoreCase(value)) {
			return null;
		}
		String normalized = value.trim().toUpperCase();
		if ("PENDING".equals(normalized)) return RatingStatus.PENDING;
		if ("APPROVED".equals(normalized)) return RatingStatus.APPROVED;
		if ("REJECTED".equals(normalized)) return RatingStatus.REJECTED;
		return null;
	}

	private RatingStatus parseStatusOrThrow(String value) {
		RatingStatus status = parseStatus(value);
		if (status == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status de moderação inválido.");
		}
		return status;
	}
}
