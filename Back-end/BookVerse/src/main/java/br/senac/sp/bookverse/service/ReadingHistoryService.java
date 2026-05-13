package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.ReadingHistoryDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.mapper.ReadingHistoryMapper;
import br.senac.sp.bookverse.model.ReadingHistory;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.security.CurrentUserService;
import br.senac.sp.bookverse.repository.ReadingHistoryRepository;
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
public class ReadingHistoryService {

	private static final Logger log = LoggerFactory.getLogger(ReadingHistoryService.class);

	private final ReadingHistoryRepository readingHistoryRepository;
	private final BookRepository bookRepository;
	private final CurrentUserService currentUserService;

	public ReadingHistoryService(
			ReadingHistoryRepository readingHistoryRepository,
			BookRepository bookRepository,
			CurrentUserService currentUserService
	) {
		this.readingHistoryRepository = readingHistoryRepository;
		this.bookRepository = bookRepository;
		this.currentUserService = currentUserService;
	}

	@Transactional(readOnly = true)
	public List<ReadingHistoryDTO> listarTodos() {
		return StreamSupport.stream(readingHistoryRepository.findAll().spliterator(), false)
				.map(ReadingHistoryMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public Page<ReadingHistoryDTO> listarTodos(Pageable pageable) {
		return readingHistoryRepository.findAll(pageable).map(ReadingHistoryMapper::toDTO);
	}

	@Transactional(readOnly = true)
	public List<ReadingHistoryDTO> listarDoUserAutenticado() {
		User usuario = currentUserService.authenticatedUser();
		return readingHistoryRepository.findByUsuarioId(usuario.getId()).stream()
				.map(ReadingHistoryMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public Page<ReadingHistoryDTO> listarDoUserAutenticado(Pageable pageable) {
		User usuario = currentUserService.authenticatedUser();
		return readingHistoryRepository.findByUsuarioId(usuario.getId(), pageable).map(ReadingHistoryMapper::toDTO);
	}

	@Transactional(readOnly = true)
	public ReadingHistoryDTO buscarPorId(Long id) {
		return ReadingHistoryMapper.toDTO(buscarEntidadePorId(id));
	}

	@Transactional
	public ReadingHistoryDTO criar(ReadingHistoryDTO dto) {
		User usuario = currentUserService.authenticatedUser();

		ReadingHistory historico = new ReadingHistory();
		historico.setStatus(dto.status());
		historico.setProgresso(dto.progresso());
		historico.setUsuario(usuario);
		historico.setLivro(bookRepository.findById(dto.livroId())
				.orElseThrow(() -> new ResourceNotFoundException("Book não encontrado.")));

		ReadingHistory salvo = readingHistoryRepository.save(historico);
		log.info("Histórico de leitura criado. id={}, usuario={}", salvo.getId(), usuario.getId());
		return ReadingHistoryMapper.toDTO(salvo);
	}

	@Transactional
	public ReadingHistoryDTO atualizar(Long id, ReadingHistoryDTO dto) {
		ReadingHistory historico = buscarEntidadePorId(id);
		User atual = currentUserService.authenticatedUser();

		if (!currentUserService.isAdmin(atual) && !historico.getUsuario().getId().equals(atual.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para alterar este histórico.");
		}

		historico.setStatus(dto.status());
		historico.setProgresso(dto.progresso());
		if (dto.livroId() != null) {
			historico.setLivro(bookRepository.findById(dto.livroId())
					.orElseThrow(() -> new ResourceNotFoundException("Book não encontrado.")));
		}

		ReadingHistory salvo = readingHistoryRepository.save(historico);
		log.info("Histórico de leitura atualizado. id={}", id);
		return ReadingHistoryMapper.toDTO(salvo);
	}

	@Transactional
	public void deletar(Long id) {
		ReadingHistory historico = buscarEntidadePorId(id);
		User atual = currentUserService.authenticatedUser();

		if (!currentUserService.isAdmin(atual) && !historico.getUsuario().getId().equals(atual.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para excluir este histórico.");
		}

		readingHistoryRepository.delete(historico);
		log.info("Histórico de leitura removido. id={}", id);
	}

	private ReadingHistory buscarEntidadePorId(Long id) {
		return readingHistoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Histórico de leitura não encontrado."));
	}

}
