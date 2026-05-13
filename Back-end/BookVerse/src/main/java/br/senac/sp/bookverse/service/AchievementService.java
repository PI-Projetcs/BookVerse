package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.AchievementDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.mapper.AchievementMapper;
import br.senac.sp.bookverse.model.Achievement;
import br.senac.sp.bookverse.repository.AchievementRepository;
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
public class AchievementService {

	private static final Logger log = LoggerFactory.getLogger(AchievementService.class);

	private final AchievementRepository achievementRepository;

	public AchievementService(AchievementRepository achievementRepository) {
		this.achievementRepository = achievementRepository;
	}

	@Transactional(readOnly = true)
	public List<AchievementDTO> listarTodas() {
		return StreamSupport.stream(achievementRepository.findAll().spliterator(), false)
				.map(AchievementMapper::toDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public Page<AchievementDTO> listarTodas(Pageable pageable) {
		return achievementRepository.findAll(pageable).map(AchievementMapper::toDTO);
	}

	@Transactional(readOnly = true)
	public AchievementDTO buscarPorId(Long id) {
		return AchievementMapper.toDTO(buscarEntidadePorId(id));
	}

	@Transactional
	public AchievementDTO criar(AchievementDTO dto) {
		validarNomeDuplicado(dto.nome(), null);
		Achievement salva = achievementRepository.save(AchievementMapper.toEntity(dto));
		log.info("Conquista criada. id={}", salva.getId());
		return AchievementMapper.toDTO(salva);
	}

	@Transactional
	public AchievementDTO atualizar(Long id, AchievementDTO dto) {
		Achievement achievement = buscarEntidadePorId(id);
		validarNomeDuplicado(dto.nome(), id);
		AchievementMapper.updateEntity(achievement, dto);
		Achievement salva = achievementRepository.save(achievement);
		log.info("Conquista atualizada. id={}", id);
		return AchievementMapper.toDTO(salva);
	}

	@Transactional
	public void deletar(Long id) {
		Achievement achievement = buscarEntidadePorId(id);
		achievementRepository.delete(achievement);
		log.info("Conquista removida. id={}", id);
	}

	private Achievement buscarEntidadePorId(Long id) {
		return achievementRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Conquista não encontrada."));
	}

	private void validarNomeDuplicado(String nome, Long idAtual) {
		boolean duplicado = achievementRepository.findByNome(nome).stream()
				.anyMatch(conquista -> idAtual == null || !idAtual.equals(conquista.getId()));
		if (duplicado) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Já existe uma conquista com esse nome.");
		}
	}
}
