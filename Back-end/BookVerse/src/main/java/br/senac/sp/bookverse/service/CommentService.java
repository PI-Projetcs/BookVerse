package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.CommentDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.mapper.CommentMapper;
import br.senac.sp.bookverse.model.CommentLike;
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
		return commentRepository.findByDiscussaoId(discussaoId, pageable).map(entity -> {
			CommentDTO dto = CommentMapper.toDTO(entity);
			long likes = commentLikeRepository.countByCommentIdAndLikedTrue(entity.getId());
			Boolean liked = false;
			try {
				User usuario = currentUserService.authenticatedUser();
				liked = commentLikeRepository.findByCommentIdAndUsuario(entity.getId(), usuario)
						.map(CommentLike::getLiked).orElse(false);
			} catch (Exception e) {
				// not authenticated; leave liked = false
			}
			return new CommentDTO(
					dto.id(), dto.conteudo(), dto.data(), dto.discussaoId(), dto.discussaoTitulo(),
					dto.usuarioId(), dto.usuarioNome(), (int) likes, liked
			);
		});
	}

	@Transactional(readOnly = true)
	public List<CommentDTO> listarPorDiscussao(Long discussaoId) {
		return commentRepository.findByDiscussaoId(discussaoId).stream().map(entity -> {
			CommentDTO dto = CommentMapper.toDTO(entity);
			long likes = commentLikeRepository.countByCommentIdAndLikedTrue(entity.getId());
			Boolean liked = false;
			try {
				User usuario = currentUserService.authenticatedUser();
				liked = commentLikeRepository.findByCommentIdAndUsuario(entity.getId(), usuario)
						.map(CommentLike::getLiked).orElse(false);
			} catch (Exception e) {
				// ignore
			}
			return new CommentDTO(
					dto.id(), dto.conteudo(), dto.data(), dto.discussaoId(), dto.discussaoTitulo(),
					dto.usuarioId(), dto.usuarioNome(), (int) likes, liked
			);
		}).toList();
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
				dto.usuarioId(), dto.usuarioNome(), (int) count, commentLike.getLiked()
		);
	}

	@Transactional
	public CommentDTO criar(CommentDTO dto) {
		User usuario = currentUserService.authenticatedUser();

		Comment comentario = new Comment();
		comentario.setConteudo(dto.conteudo());
		comentario.setData(LocalDateTime.now());
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
}
