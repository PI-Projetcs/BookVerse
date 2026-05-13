package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.DiscussionDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.mapper.DiscussionMapper;
import br.senac.sp.bookverse.model.Discussion;
import br.senac.sp.bookverse.repository.DiscussionRepository;
import br.senac.sp.bookverse.repository.BookRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.StreamSupport;

@Service
public class DiscussionService {

	private static final Logger log = LoggerFactory.getLogger(DiscussionService.class);

	private final DiscussionRepository discussionRepository;
	private final BookRepository bookRepository;

	public DiscussionService(DiscussionRepository discussionRepository, BookRepository bookRepository) {
		this.discussionRepository = discussionRepository;
		this.bookRepository = bookRepository;
	}

	@Transactional(readOnly = true)
	public List<DiscussionDTO> listarTodas() {
		return StreamSupport.stream(discussionRepository.findAll().spliterator(), false)
				.map(DiscussionMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public Page<DiscussionDTO> listarTodas(Pageable pageable) {
		return discussionRepository.findAll(pageable).map(DiscussionMapper::toDTO);
	}

	@Transactional(readOnly = true)
	public DiscussionDTO buscarPorId(Long id) {
		return DiscussionMapper.toDTO(buscarEntidadePorId(id));
	}

	@Transactional(readOnly = true)
	public List<DiscussionDTO> listarPorBook(Long livroId) {
		return discussionRepository.findByLivroId(livroId).stream()
				.map(DiscussionMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public Page<DiscussionDTO> listarPorBook(Long livroId, Pageable pageable) {
		return discussionRepository.findByLivroId(livroId, pageable).map(DiscussionMapper::toDTO);
	}

	@Transactional
	public DiscussionDTO criar(DiscussionDTO dto) {
		Discussion discussao = new Discussion();
		discussao.setTitulo(dto.titulo());
		discussao.setDescricao(dto.descricao());
		discussao.setLivro(bookRepository.findById(dto.livroId())
				.orElseThrow(() -> new ResourceNotFoundException("Book não encontrado.")));
		Discussion salva = discussionRepository.save(discussao);
		log.info("Discussão criada. id={}", salva.getId());
		return DiscussionMapper.toDTO(salva);
	}

	@Transactional
	public DiscussionDTO atualizar(Long id, DiscussionDTO dto) {
		Discussion discussao = buscarEntidadePorId(id);
		discussao.setTitulo(dto.titulo());
		discussao.setDescricao(dto.descricao());
		if (dto.livroId() != null) {
			discussao.setLivro(bookRepository.findById(dto.livroId())
					.orElseThrow(() -> new ResourceNotFoundException("Book não encontrado.")));
		}
		Discussion salva = discussionRepository.save(discussao);
		log.info("Discussão atualizada. id={}", id);
		return DiscussionMapper.toDTO(salva);
	}

	@Transactional
	public void deletar(Long id) {
		Discussion discussao = buscarEntidadePorId(id);
		discussionRepository.delete(discussao);
		log.info("Discussão removida. id={}", id);
	}

	private Discussion buscarEntidadePorId(Long id) {
		return discussionRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Discussão não encontrada."));
	}
}
