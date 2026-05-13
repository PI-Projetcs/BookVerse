package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.RatingDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.mapper.RatingMapper;
import br.senac.sp.bookverse.model.Rating;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.security.CurrentUserService;
import br.senac.sp.bookverse.repository.RatingRepository;
import br.senac.sp.bookverse.repository.BookRepository;
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

	public RatingService(
			RatingRepository ratingRepository,
			BookRepository bookRepository,
			CurrentUserService currentUserService
	) {
		this.ratingRepository = ratingRepository;
		this.bookRepository = bookRepository;
		this.currentUserService = currentUserService;
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
	public RatingDTO buscarPorId(Long id) {
		return RatingMapper.toDTO(buscarEntidadePorId(id));
	}

	@Transactional
	public RatingDTO criar(RatingDTO dto) {
		User usuario = currentUserService.authenticatedUser();
		Rating avaliacao = new Rating();
		avaliacao.setNota(dto.nota());
		avaliacao.setDescricao(dto.descricao());
		avaliacao.setUsuario(usuario);
		avaliacao.setLivro(bookRepository.findById(dto.livroId())
				.orElseThrow(() -> new ResourceNotFoundException("Book não encontrado.")));
		Rating salva = ratingRepository.save(avaliacao);
		log.info("Avaliação criada. id={}, usuario={}", salva.getId(), usuario.getId());
		return RatingMapper.toDTO(salva);
	}

	@Transactional
	public RatingDTO atualizar(Long id, RatingDTO dto) {
		Rating avaliacao = buscarEntidadePorId(id);
		User atual = currentUserService.authenticatedUser();
		if (!currentUserService.isAdmin(atual) && !avaliacao.getUsuario().getId().equals(atual.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para alterar esta avaliação.");
		}

		avaliacao.setNota(dto.nota());
		avaliacao.setDescricao(dto.descricao());
		if (dto.livroId() != null) {
			avaliacao.setLivro(bookRepository.findById(dto.livroId())
					.orElseThrow(() -> new ResourceNotFoundException("Book não encontrado.")));
		}

		Rating salva = ratingRepository.save(avaliacao);
		log.info("Avaliação atualizada. id={}", id);
		return RatingMapper.toDTO(salva);
	}

	@Transactional
	public void deletar(Long id) {
		Rating avaliacao = buscarEntidadePorId(id);
		User atual = currentUserService.authenticatedUser();
		if (!currentUserService.isAdmin(atual) && !avaliacao.getUsuario().getId().equals(atual.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para excluir esta avaliação.");
		}
		ratingRepository.delete(avaliacao);
		log.info("Avaliação removida. id={}", id);
	}

	private Rating buscarEntidadePorId(Long id) {
		return ratingRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada."));
	}

}
