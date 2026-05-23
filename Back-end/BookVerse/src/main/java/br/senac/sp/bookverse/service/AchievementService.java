package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.AchievementDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.mapper.AchievementMapper;
import br.senac.sp.bookverse.model.Achievement;
import br.senac.sp.bookverse.model.AchievementCriteriaType;
import br.senac.sp.bookverse.model.PerfilUsuario;
import br.senac.sp.bookverse.model.ReadingStatus;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.repository.AchievementRepository;
import br.senac.sp.bookverse.repository.PerfilUsuarioRepository;
import br.senac.sp.bookverse.repository.RatingRepository;
import br.senac.sp.bookverse.repository.ReadingHistoryRepository;
import br.senac.sp.bookverse.repository.UserRepository;
import br.senac.sp.bookverse.security.CurrentUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.StreamSupport;

@Service
public class AchievementService {

	private static final Logger log = LoggerFactory.getLogger(AchievementService.class);

	private final AchievementRepository achievementRepository;
	private final UserRepository userRepository;
	private final CurrentUserService currentUserService;
	private final ReadingHistoryRepository readingHistoryRepository;
	private final RatingRepository ratingRepository;
	private final PerfilUsuarioRepository perfilUsuarioRepository;

	public AchievementService(
			AchievementRepository achievementRepository,
			UserRepository userRepository,
			CurrentUserService currentUserService,
			ReadingHistoryRepository readingHistoryRepository,
			RatingRepository ratingRepository,
			PerfilUsuarioRepository perfilUsuarioRepository
	) {
		this.achievementRepository = achievementRepository;
		this.userRepository = userRepository;
		this.currentUserService = currentUserService;
		this.readingHistoryRepository = readingHistoryRepository;
		this.ratingRepository = ratingRepository;
		this.perfilUsuarioRepository = perfilUsuarioRepository;
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
		validarDto(dto);
		validarNomeDuplicado(dto.nome(), null);
		Achievement salva = achievementRepository.save(AchievementMapper.toEntity(dto));
		log.info("Conquista criada. id={}", salva.getId());
		return AchievementMapper.toDTO(salva);
	}

	@Transactional
	public AchievementDTO atualizar(Long id, AchievementDTO dto) {
		Achievement achievement = buscarEntidadePorId(id);
		validarDto(dto);
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

	@Transactional
	public List<AchievementDTO> avaliarERegistrarConquistasDoUsuarioLogado() {
		User usuario = currentUserService.authenticatedUser();
		return avaliarERegistrarConquistasDoUsuario(usuario.getId());
	}

	@Transactional
	public List<AchievementDTO> avaliarERegistrarConquistasDoUsuario(Long usuarioId) {
		User usuario = userRepository.findById(usuarioId)
				.orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

		Set<Long> conquistasAtuais = new LinkedHashSet<>();
		if (usuario.getConquistas() != null) {
			usuario.getConquistas().forEach(conquista -> {
				if (conquista != null && conquista.getId() != null) {
					conquistasAtuais.add(conquista.getId());
				}
			});
		}

		List<Achievement> conquistasCandidatas = achievementRepository.findByAtivoTrue();
		List<Achievement> novasConquistas = new ArrayList<>();

		for (Achievement achievement : conquistasCandidatas) {
			if (achievement == null || achievement.getId() == null || conquistasAtuais.contains(achievement.getId())) {
				continue;
			}

			long progresso = calcularProgresso(usuarioId, achievement);
			Integer alvo = achievement.getTargetValue();
			if (alvo != null && progresso >= alvo) {
				novasConquistas.add(achievement);
				conquistasAtuais.add(achievement.getId());
			}
		}

		if (!novasConquistas.isEmpty()) {
			if (usuario.getConquistas() == null) {
				usuario.setConquistas(new ArrayList<>());
			}
			usuario.getConquistas().addAll(novasConquistas);
			userRepository.save(usuario);
			log.info("Conquistas atribuídas automaticamente. usuarioId={}, novas={}", usuarioId, novasConquistas.size());
		}

		return novasConquistas.stream().map(AchievementMapper::toDTO).toList();
	}

	@Transactional(readOnly = true)
	public List<AchievementProgressDTO> listarProgressoDoUsuarioLogado() {
		User usuario = currentUserService.authenticatedUser();
		return listarProgressoDoUsuario(usuario.getId());
	}

	@Transactional(readOnly = true)
	public List<AchievementProgressDTO> listarProgressoDoUsuario(Long usuarioId) {
		return achievementRepository.findAll().stream()
				.filter(achievement -> achievement != null && achievement.getId() != null)
				.map(achievement -> toProgressDTO(usuarioId, achievement))
				.toList();
	}

	@Transactional(readOnly = true)
	public AchievementProgressDTO calcularProgressoDoUsuario(Long usuarioId, Long achievementId) {
		Achievement achievement = buscarEntidadePorId(achievementId);
		return toProgressDTO(usuarioId, achievement);
	}

	private AchievementProgressDTO toProgressDTO(Long usuarioId, Achievement achievement) {
		long progressoAtual = calcularProgresso(usuarioId, achievement);
		long targetValue = achievement.getTargetValue() != null ? achievement.getTargetValue() : 0L;
		return new AchievementProgressDTO(
				achievement.getId(),
				actionTypeLabel(achievement.getCriteriaType()),
				achievement.getCriteriaType() != null ? achievement.getCriteriaType().name() : null,
				progressoAtual,
				targetValue,
				progressoAtual >= (targetValue > 0 ? targetValue : Long.MAX_VALUE)
		);
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

	private void validarDto(AchievementDTO dto) {
		if (dto == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Conquista inválida.");
		}
		if (dto.criteriaType() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de critério é obrigatório.");
		}
		if (dto.targetValue() == null || dto.targetValue() <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valor-alvo deve ser maior que zero.");
		}
	}

	private long calcularProgresso(Long usuarioId, Achievement achievement) {
		AchievementCriteriaType criteriaType = achievement.getCriteriaType();
		if (criteriaType == null) {
			return 0L;
		}

		return switch (criteriaType) {
			case READ_BOOKS -> readingHistoryRepository.countDistinctCompletedBooksByUsuarioId(usuarioId);
			case RATINGS_CREATED -> ratingRepository.countByUsuarioId(usuarioId);
			case FAVORITES_ADDED -> perfilUsuarioRepository.countFavoriteBooksByUsuarioId(usuarioId);
		};
	}

	private String actionTypeLabel(AchievementCriteriaType criteriaType) {
		if (criteriaType == null) {
			return "Desconhecido";
		}

		return switch (criteriaType) {
			case READ_BOOKS -> "Livros lidos";
			case RATINGS_CREATED -> "Avaliações feitas";
			case FAVORITES_ADDED -> "Favoritos adicionados";
		};
	}

	public record AchievementProgressDTO(
			Long achievementId,
			String label,
			String criteriaType,
			long currentValue,
			long targetValue,
			boolean completed
	) {
	}

	@Transactional(readOnly = true)
	public List<AchievementAggregateDTO> listarAgregadoParaTodasConquistas() {
		List<User> users = userRepository.findAll();
		long totalUsers = users.size();
		return achievementRepository.findAll().stream()
			.filter(achievement -> achievement != null && achievement.getId() != null)
			.map(achievement -> {
				long target = achievement.getTargetValue() != null ? achievement.getTargetValue() : 0L;
				long usersMeeting = users.stream()
					.filter(u -> calcularProgresso(u.getId(), achievement) >= target)
					.count();
				double percentage = totalUsers > 0 ? (usersMeeting * 100.0 / totalUsers) : 0.0;
				return new AchievementAggregateDTO(
					achievement.getId(),
					actionTypeLabel(achievement.getCriteriaType()),
					achievement.getCriteriaType() != null ? achievement.getCriteriaType().name() : null,
					usersMeeting,
					totalUsers,
					percentage
				);
			})
			.toList();
	}

	public record AchievementAggregateDTO(
		Long achievementId,
		String label,
		String criteriaType,
		long usersMeetingCount,
		long totalUsers,
		double percentage
	) {
	}
}
