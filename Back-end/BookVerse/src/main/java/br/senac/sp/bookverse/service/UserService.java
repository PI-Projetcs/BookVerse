package br.senac.sp.bookverse.service;

import br.senac.sp.bookverse.dto.RegistrationRequest;
import br.senac.sp.bookverse.dto.UserUpdateDTO;
import br.senac.sp.bookverse.dto.UserResponseDTO;
import br.senac.sp.bookverse.dto.UserStatusUpdateDTO;
import br.senac.sp.bookverse.exception.ResourceNotFoundException;
import br.senac.sp.bookverse.mapper.UserMapper;
import br.senac.sp.bookverse.model.Role;
import br.senac.sp.bookverse.model.User;
import br.senac.sp.bookverse.security.CurrentUserService;
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

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            CurrentUserService currentUserService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public UserResponseDTO registrar(RegistrationRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já cadastrado.");
        }
        User usuario = new User();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setRole(Role.USER);
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
}
