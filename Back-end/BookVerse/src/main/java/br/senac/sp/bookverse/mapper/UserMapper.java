package br.senac.sp.bookverse.mapper;

import br.senac.sp.bookverse.dto.UserResponseDTO;
import br.senac.sp.bookverse.model.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponseDTO toResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponseDTO(user.getId(), user.getNome(), user.getEmail(), user.getRole());
    }
}

