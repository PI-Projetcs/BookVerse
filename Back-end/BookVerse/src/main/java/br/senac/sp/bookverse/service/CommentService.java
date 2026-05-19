package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.CommentDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.mapper.CommentMapper;
import br.senac.sp.bookverse.model.CommentLike;
import br.senac.sp.bookverse.model.CommentStatus;
import br.senac.sp.bookverse.repository.CommentLikeRepository;
import br.senac.sp.bookverse.model.Comment;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.DiscussionRepository;
import br.senac.sp.bookverse.security.CurrentUserService;
import br.senac.sp.bookverse.repository.CommentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.StreamSupport;

@Service
public class CommentService {

	private static final Logger log = LoggerFactory.getLogger(CommentService.class);

	private final CommentRepository commentRepository;
	private final DiscussionRepository discussionRepository;
	private final CurrentUserService currentUserService;
	private final CommentLikeRepository commentLikeRepository;

	public CommentService(
			CommentRepository commentRepository,
			DiscussionRepository discussionRepository,
			CurrentUserService currentUserService,
			CommentLikeRepository commentLikeRepository
	) {
		this.commentRepository = commentRepository;
		this.discussionRepository = discussionRepository;
		this.currentUserService = currentUserService;
		this.commentLikeRepository = commentLikeRepository;
	}

	@Transactional(readOnly = true)
	public List<CommentDTO> listarTodos() {
		return StreamSupport.stream(commentRepository.findAll().spliterator(), false)
				.map(CommentMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public Page<CommentDTO> listarTodos(Pageable pageable) {
		return commentRepository.findAll(pageable).map(CommentMapper::toDTO);
	}

	@Transactional(readOnly = true)
	public CommentDTO buscarPorId(Long id) {
		return CommentMapper.toDTO(buscarEntidadePorId(id));
	}

	@Transactional(readOnly = true)
	public Page<CommentDTO> listarPorDiscussao(Long discussaoId, Pageable pageable) {
		User viewer = tryAuthenticatedUser();
		boolean canModerate = currentUserService.canModerate(viewer);
		Page<Comment> page = canModerate
				? commentRepository.findByDiscussaoId(discussaoId, pageable)
				: commentRepository.findByDiscussaoIdAndStatus(discussaoId, CommentStatus.APPROVED, pageable);

		return page.map(entity -> {
			CommentDTO dto = CommentMapper.toDTO(entity);
			long likes = commentLikeRepository.countByCommentIdAndLikedTrue(entity.getId());
			Boolean liked = false;
			if (viewer != null) {
				liked = commentLikeRepository.findByCommentIdAndUsuario(entity.getId(), viewer)
						.map(CommentLike::getLiked).orElse(false);
			}
			return new CommentDTO(
					dto.id(), dto.conteudo(), dto.data(), dto.discussaoId(), dto.discussaoTitulo(),
					dto.usuarioId(), dto.usuarioNome(), dto.status(), (int) likes, liked
			);
		});
	}

	@Transactional(readOnly = true)
	public List<CommentDTO> listarPorDiscussao(Long discussaoId) {
		User viewer = tryAuthenticatedUser();
		boolean canModerate = currentUserService.canModerate(viewer);
		List<Comment> comments = canModerate
				? commentRepository.findByDiscussaoId(discussaoId)
				: commentRepository.findByDiscussaoIdAndStatus(discussaoId, CommentStatus.APPROVED);

		return comments.stream().map(entity -> {
			CommentDTO dto = CommentMapper.toDTO(entity);
			long likes = commentLikeRepository.countByCommentIdAndLikedTrue(entity.getId());
			Boolean liked = false;
			if (viewer != null) {
				liked = commentLikeRepository.findByCommentIdAndUsuario(entity.getId(), viewer)
						.map(CommentLike::getLiked).orElse(false);
			}
			return new CommentDTO(
					dto.id(), dto.conteudo(), dto.data(), dto.discussaoId(), dto.discussaoTitulo(),
					dto.usuarioId(), dto.usuarioNome(), dto.status(), (int) likes, liked
			);
		}).toList();
	}

	@Transactional(readOnly = true)
	public List<CommentDTO> listarParaModeracao(String statusFilter, String query) {
		CommentStatus status = parseStatus(statusFilter);
		String queryText = String.valueOf(query == null ? "" : query).trim().toLowerCase();
		List<Comment> items = status == null
				? commentRepository.findAll()
				: commentRepository.findByStatus(status);

		return items.stream()
				.filter(comment -> {
					if (queryText.isEmpty()) {
						return true;
					}
					String author = comment.getUsuario() != null ? String.valueOf(comment.getUsuario().getNome()) : "";
					String chapter = comment.getDiscussao() != null ? String.valueOf(comment.getDiscussao().getTitulo()) : "";
					String book = (comment.getDiscussao() != null && comment.getDiscussao().getLivro() != null)
							? String.valueOf(comment.getDiscussao().getLivro().getTitulo())
							: "";
					String content = String.valueOf(comment.getConteudo());
					String searchable = String.join(" ", author, chapter, book, content).toLowerCase();
					return searchable.contains(queryText);
				})
				.sorted((left, right) -> {
					if (left.getData() == null && right.getData() == null) return 0;
					if (left.getData() == null) return 1;
					if (right.getData() == null) return -1;
					return right.getData().compareTo(left.getData());
				})
				.map(entity -> {
					CommentDTO dto = CommentMapper.toDTO(entity);
					long likes = commentLikeRepository.countByCommentIdAndLikedTrue(entity.getId());
					return new CommentDTO(
							dto.id(), dto.conteudo(), dto.data(), dto.discussaoId(), dto.discussaoTitulo(),
							dto.usuarioId(), dto.usuarioNome(), dto.status(), (int) likes, false
					);
				})
				.toList();
	}

	@Transactional
	public CommentDTO atualizarStatusModeracao(Long id, String statusValue) {
		Comment comentario = buscarEntidadePorId(id);
		CommentStatus nextStatus = parseStatusOrThrow(statusValue);
		comentario.setStatus(nextStatus);
		Comment salvo = commentRepository.save(comentario);
		CommentDTO dto = CommentMapper.toDTO(salvo);
		long likes = commentLikeRepository.countByCommentIdAndLikedTrue(salvo.getId());
		return new CommentDTO(
				dto.id(), dto.conteudo(), dto.data(), dto.discussaoId(), dto.discussaoTitulo(),
				dto.usuarioId(), dto.usuarioNome(), dto.status(), (int) likes, false
		);
	}

	@Transactional
	public CommentDTO toggleCommentLike(Long commentId, Boolean liked) {
		Comment comentario = buscarEntidadePorId(commentId);
		User usuario = currentUserService.authenticatedUser();

		CommentLike commentLike = commentLikeRepository.findByCommentIdAndUsuario(commentId, usuario)
				.orElseGet(() -> new CommentLike(commentId, usuario, liked != null ? liked : true));

		commentLike.setLiked(liked != null ? liked : !commentLike.getLiked());
		commentLikeRepository.save(commentLike);

		long count = commentLikeRepository.countByCommentIdAndLikedTrue(commentId);

		CommentDTO dto = CommentMapper.toDTO(comentario);
		return new CommentDTO(
				dto.id(), dto.conteudo(), dto.data(), dto.discussaoId(), dto.discussaoTitulo(),
				dto.usuarioId(), dto.usuarioNome(), dto.status(), (int) count, commentLike.getLiked()
		);
	}

	@Transactional
	public CommentDTO criar(CommentDTO dto) {
		User usuario = currentUserService.authenticatedUser();

		Comment comentario = new Comment();
		comentario.setConteudo(dto.conteudo());
		comentario.setData(LocalDateTime.now());
		comentario.setStatus(CommentStatus.PENDING);
		comentario.setUsuario(usuario);
		comentario.setDiscussao(discussionRepository.findById(dto.discussaoId())
				.orElseThrow(() -> new ResourceNotFoundException("Discussão não encontrada.")));

		Comment salvo = commentRepository.save(comentario);
		log.info("Comentário criado. id={}, usuario={}", salvo.getId(), usuario.getId());
		return CommentMapper.toDTO(salvo);
	}

	@Transactional
	public CommentDTO atualizar(Long id, CommentDTO dto) {
		Comment comentario = buscarEntidadePorId(id);
		User atual = currentUserService.authenticatedUser();

		if (!currentUserService.isAdmin(atual) && !comentario.getUsuario().getId().equals(atual.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para alterar este comentário.");
		}

		comentario.setConteudo(dto.conteudo());
		if (!currentUserService.canModerate(atual)) {
			comentario.setStatus(CommentStatus.PENDING);
		}
		if (dto.discussaoId() != null) {
			comentario.setDiscussao(discussionRepository.findById(dto.discussaoId())
					.orElseThrow(() -> new ResourceNotFoundException("Discussão não encontrada.")));
		}

		Comment salvo = commentRepository.save(comentario);
		log.info("Comentário atualizado. id={}", id);
		return CommentMapper.toDTO(salvo);
	}

	@Transactional
	public void deletar(Long id) {
		Comment comentario = buscarEntidadePorId(id);
		User atual = currentUserService.authenticatedUser();

		if (!currentUserService.isAdmin(atual) && !comentario.getUsuario().getId().equals(atual.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para excluir este comentário.");
		}

		commentRepository.delete(comentario);
		log.info("Comentário removido. id={}", id);
	}

	private Comment buscarEntidadePorId(Long id) {
		return commentRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Comentário não encontrado."));
	}

	private User tryAuthenticatedUser() {
		try {
			return currentUserService.authenticatedUser();
		} catch (Exception e) {
			return null;
		}
	}

	private CommentStatus parseStatus(String value) {
		if (value == null || value.trim().isEmpty() || "all".equalsIgnoreCase(value)) {
			return null;
		}

		String normalized = value.trim().toUpperCase();
		if ("PENDING".equals(normalized)) return CommentStatus.PENDING;
		if ("APPROVED".equals(normalized)) return CommentStatus.APPROVED;
		if ("REJECTED".equals(normalized)) return CommentStatus.REJECTED;
		return null;
	}

	private CommentStatus parseStatusOrThrow(String value) {
		CommentStatus status = parseStatus(value);
		if (status == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status de moderação inválido.");
		}
		return status;
	}
}
