package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.AchievementDTO;
import br.senac.sp.bookverse.dto.BookDTO;
import br.senac.sp.bookverse.dto.RegistrationRequest;
import br.senac.sp.bookverse.dto.PerfilUsuarioDTO;
import br.senac.sp.bookverse.dto.RatingDTO;
import br.senac.sp.bookverse.dto.ReadingHistoryDTO;
import br.senac.sp.bookverse.dto.UserUpdateDTO;
import br.senac.sp.bookverse.dto.UserResponseDTO;
import br.senac.sp.bookverse.dto.UserStatusUpdateDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.mapper.AchievementMapper;
import br.senac.sp.bookverse.mapper.BookMapper;
import br.senac.sp.bookverse.mapper.RatingMapper;
import br.senac.sp.bookverse.mapper.ReadingHistoryMapper;
import br.senac.sp.bookverse.mapper.UserMapper;
import br.senac.sp.bookverse.model.Book;
import br.senac.sp.bookverse.model.PerfilUsuario;
import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.model.Achievement;
import br.senac.sp.bookverse.model.ReadingHistory;
import br.senac.sp.bookverse.model.Rating;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.security.CurrentUserService;
import br.senac.sp.bookverse.repository.AchievementRepository;
import br.senac.sp.bookverse.repository.BookRepository;
import br.senac.sp.bookverse.repository.PerfilUsuarioRepository;
import br.senac.sp.bookverse.repository.RatingRepository;
import br.senac.sp.bookverse.repository.ReadingHistoryRepository;
import br.senac.sp.bookverse.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.StreamSupport;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;
    private final PerfilUsuarioRepository perfilUsuarioRepository;
    private final BookRepository bookRepository;
    private final RatingRepository ratingRepository;
    private final ReadingHistoryRepository readingHistoryRepository;
    private final AchievementRepository achievementRepository;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            CurrentUserService currentUserService,
            PerfilUsuarioRepository perfilUsuarioRepository,
            BookRepository bookRepository,
            RatingRepository ratingRepository,
            ReadingHistoryRepository readingHistoryRepository,
            AchievementRepository achievementRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
        this.perfilUsuarioRepository = perfilUsuarioRepository;
        this.bookRepository = bookRepository;
        this.ratingRepository = ratingRepository;
        this.readingHistoryRepository = readingHistoryRepository;
        this.achievementRepository = achievementRepository;
    }

    @Transactional
    public UserResponseDTO registrar(RegistrationRequest request) {
        String email = request.email().trim().toLowerCase();
        var existente = userRepository.findByEmail(email);
        if (existente.isPresent()) {
            User usuarioExistente = existente.get();

            if (Boolean.FALSE.equals(usuarioExistente.getAtivo()) && Role.USER.equals(usuarioExistente.getRole())) {
                usuarioExistente.setNome(request.nome().trim());
                usuarioExistente.setSenha(passwordEncoder.encode(request.senha()));
                usuarioExistente.setAtivo(true);
                if (usuarioExistente.getPerfilUsuario() == null) {
                    prepararPerfil(usuarioExistente);
                }
                User reativado = userRepository.save(usuarioExistente);
                log.info("Usuário reativado. id={}, email={}", reativado.getId(), reativado.getEmail());
                return UserMapper.toResponse(reativado);
            }

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já cadastrado.");
        }
        User usuario = new User();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setRole(Role.USER);
        prepararPerfil(usuario);
        User salvo = userRepository.save(usuario);
        log.info("Novo usuário registrado. id={}, email={}", salvo.getId(), salvo.getEmail());
        return UserMapper.toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> listarTodos() {
        return StreamSupport.stream(userRepository.findAll().spliterator(), false)
                .map(UserMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<UserResponseDTO> listarTodos(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO buscarPorId(Long id) {
        User atual = currentUserService.authenticatedUser();
        User alvo = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        if (!currentUserService.isAdmin(atual) && !atual.getId().equals(alvo.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para ver este usuário.");
        }
        log.debug("Usuário consultado. solicitante={}, alvo={}", atual.getId(), alvo.getId());
            return UserMapper.toResponse(alvo);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO perfilAutenticado() {
            return UserMapper.toResponse(currentUserService.authenticatedUser());
    }

    @Transactional
    public PerfilUsuarioDTO perfilDetalhadoAutenticado() {
        User usuario = currentUserService.authenticatedUser();
        PerfilUsuario perfil = obterOuCriarPerfil(usuario);
        return montarPerfilDto(usuario, perfil);
    }

    @Transactional
    public PerfilUsuarioDTO perfilDetalhadoPorId(Long id) {
        User atual = currentUserService.authenticatedUser();
        User alvo = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (!currentUserService.isAdmin(atual) && !atual.getId().equals(alvo.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para ver este perfil.");
        }

        return montarPerfilDto(alvo, obterOuCriarPerfil(alvo));
    }

    @Transactional(readOnly = true)
    public List<BookDTO> listarFavoritosAutenticado() {
        PerfilUsuario perfil = obterPerfilAutenticado();
        return perfil.getLivrosFavoritos().stream()
                .map(BookMapper::toDTO)
                .toList();
    }

    @Transactional
    public PerfilUsuarioDTO adicionarFavorito(Long livroId) {
        User usuario = currentUserService.authenticatedUser();
        PerfilUsuario perfil = obterOuCriarPerfil(usuario);
        Book livro = buscarLivroPorId(livroId);
        perfil.adicionarFavorito(livro);
        perfilUsuarioRepository.save(perfil);
        log.info("Favorito adicionado. usuarioId={}, livroId={}", usuario.getId(), livroId);
        return montarPerfilDto(usuario, perfil);
    }

    @Transactional
    public PerfilUsuarioDTO removerFavorito(Long livroId) {
        User usuario = currentUserService.authenticatedUser();
        PerfilUsuario perfil = obterOuCriarPerfil(usuario);
        Book livro = buscarLivroPorId(livroId);
        perfil.removerFavorito(livro);
        perfilUsuarioRepository.save(perfil);
        log.info("Favorito removido. usuarioId={}, livroId={}", usuario.getId(), livroId);
        return montarPerfilDto(usuario, perfil);
    }

    @Transactional(readOnly = true)
    public List<ReadingHistoryDTO> meusLivrosLidos() {
        User usuario = currentUserService.authenticatedUser();
        return readingHistoryRepository.findByUsuarioId(usuario.getId()).stream()
                .map(ReadingHistoryMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReadingHistoryDTO> livrosLidosPorId(Long id) {
        User atual = currentUserService.authenticatedUser();
        User alvo = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (!currentUserService.isAdmin(atual) && !atual.getId().equals(alvo.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para ver este perfil.");
        }

        return readingHistoryRepository.findByUsuarioId(alvo.getId()).stream()
                .map(ReadingHistoryMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RatingDTO> minhasAvaliacoes() {
        User usuario = currentUserService.authenticatedUser();
        return ratingRepository.findByUsuarioId(usuario.getId()).stream()
                .map(RatingMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RatingDTO> avaliacoesPorId(Long id) {
        User atual = currentUserService.authenticatedUser();
        User alvo = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (!currentUserService.isAdmin(atual) && !atual.getId().equals(alvo.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para ver este perfil.");
        }

        return ratingRepository.findByUsuarioId(alvo.getId()).stream()
                .map(RatingMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AchievementDTO> minhasConquistas() {
        User usuario = currentUserService.authenticatedUser();
        return usuario.getConquistas().stream()
                .map(AchievementMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AchievementDTO> conquistasPorId(Long id) {
        User atual = currentUserService.authenticatedUser();
        User alvo = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (!currentUserService.isAdmin(atual) && !atual.getId().equals(alvo.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para ver este perfil.");
        }

        return alvo.getConquistas().stream()
                .map(AchievementMapper::toDTO)
                .toList();
    }

    @Transactional
    public void autoExcluirConta() {
        User atual = currentUserService.authenticatedUser();

        if (Role.ADMIN.equals(atual.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta de administrador não pode ser autoexcluída.");
        }

        atual.setAtivo(false);
        userRepository.save(atual);
        log.info("Autoexclusão lógica realizada. usuarioId={}", atual.getId());
    }

    @Transactional
    public UserResponseDTO atualizar(Long id, UserUpdateDTO dto) {
        User atual = currentUserService.authenticatedUser();
        User alvo = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (!currentUserService.isAdmin(atual) && !atual.getId().equals(alvo.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para alterar este usuário.");
        }

        if (dto.nome() != null && !dto.nome().isBlank()) {
            alvo.setNome(dto.nome().trim());
        }
        if (dto.email() != null && !dto.email().isBlank()) {
            String novoEmail = dto.email().trim().toLowerCase();
            if (!novoEmail.equalsIgnoreCase(alvo.getEmail())
                    && userRepository.findByEmail(novoEmail).isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já em uso.");
            }
            alvo.setEmail(novoEmail);
        }
        if (dto.senha() != null && !dto.senha().isBlank()) {
            alvo.setSenha(passwordEncoder.encode(dto.senha()));
        }
        if (dto.role() != null) {
            if (!currentUserService.isAdmin(atual)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas administrador pode alterar o papel.");
            }

            if (Role.ADMIN.equals(alvo.getRole()) && !Role.ADMIN.equals(dto.role())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta de administrador não pode ter papel alterado.");
            }

            alvo.setRole(dto.role());
        }

        User salvo = userRepository.save(alvo);
        log.info("Usuário atualizado. id={}, executor={}", salvo.getId(), atual.getId());
        return UserMapper.toResponse(salvo);
    }

    @Transactional
    public void deletar(Long id) {
        User atual = currentUserService.authenticatedUser();
        if (!currentUserService.isAdmin(atual)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para excluir usuários.");
        }
        User alvo = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (Role.ADMIN.equals(alvo.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta de administrador não pode ser excluída ou inativada.");
        }

        userRepository.delete(alvo);
        log.info("Usuário removido. id={}, executor={}", id, atual.getId());
    }

    @Transactional
    public UserResponseDTO atualizarStatus(Long id, UserStatusUpdateDTO dto) {
        User atual = currentUserService.authenticatedUser();
        if (!currentUserService.isAdmin(atual)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para alterar status de usuários.");
        }

        User alvo = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (Role.ADMIN.equals(alvo.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta de administrador não pode ser excluída ou inativada.");
        }

        String status = dto.status() == null ? "" : dto.status().trim().toLowerCase();
        if (!"active".equals(status) && !"blocked".equals(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status inválido. Use 'active' ou 'blocked'.");
        }

        alvo.setAtivo("active".equals(status));
        User salvo = userRepository.save(alvo);
        log.info("Status de usuário atualizado. alvo={}, status={}, executor={}", salvo.getId(), status, atual.getId());
        return UserMapper.toResponse(salvo);
    }

    @Transactional
    public UserResponseDTO promoverParaAdmin(Long id) {
        User atual = currentUserService.authenticatedUser();
        if (!currentUserService.isAdmin(atual)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para promover usuários.");
        }

        User alvo = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (Role.ADMIN.equals(alvo.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário já é administrador.");
        }

        if (atual.getId() != null && atual.getId().equals(alvo.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Auto promoção não é permitida.");
        }

        alvo.setRole(Role.ADMIN);
        User salvo = userRepository.save(alvo);
        log.info("Usuário promovido para admin. alvo={}, executor={}", salvo.getId(), atual.getId());
        return UserMapper.toResponse(salvo);
    }

    private PerfilUsuario obterPerfilAutenticado() {
        User usuario = currentUserService.authenticatedUser();
        return obterOuCriarPerfil(usuario);
    }

    private PerfilUsuario obterOuCriarPerfil(User usuario) {
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Não autenticado.");
        }

        if (usuario.getPerfilUsuario() != null) {
            return usuario.getPerfilUsuario();
        }

        return perfilUsuarioRepository.findByUsuarioId(usuario.getId())
                .orElseGet(() -> {
                    PerfilUsuario perfil = new PerfilUsuario();
                    perfil.setUsuario(usuario);
                    usuario.setPerfilUsuario(perfil);
                    userRepository.save(usuario);
                    return perfil;
                });
    }

    private void prepararPerfil(User usuario) {
        PerfilUsuario perfil = new PerfilUsuario();
        perfil.setUsuario(usuario);
        usuario.setPerfilUsuario(perfil);
    }

    private Book buscarLivroPorId(Long livroId) {
        return bookRepository.findById(livroId)
                .orElseThrow(() -> new ResourceNotFoundException("Livro não encontrado."));
    }

    private PerfilUsuarioDTO montarPerfilDto(User usuario, PerfilUsuario perfil) {
        List<BookDTO> favoritos = perfil.getLivrosFavoritos().stream()
                .map(BookMapper::toDTO)
                .toList();

        List<ReadingHistoryDTO> lidos = readingHistoryRepository.findByUsuarioId(usuario.getId()).stream()
                .map(ReadingHistoryMapper::toDTO)
                .toList();

        List<RatingDTO> avaliacoes = ratingRepository.findByUsuarioId(usuario.getId()).stream()
                .map(RatingMapper::toDTO)
                .toList();

        List<AchievementDTO> conquistas = usuario.getConquistas().stream()
                .map(AchievementMapper::toDTO)
                .toList();

        return new PerfilUsuarioDTO(
                UserMapper.toResponse(usuario),
                favoritos,
                lidos,
                avaliacoes,
                conquistas
        );
    }
}
