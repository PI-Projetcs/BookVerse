import api from './api';
import { MOCK_USER } from '../mocks/UserMock';

// Mock mode toggle - respect environment variable
const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// Mock store for profile updates
let mockProfileStore = {
  ...MOCK_USER,
};

function normalizeProfile(payload = {}) {
  const source = payload?.item || payload;
  return {
    id: source?.id ?? null,
    name: source?.name || source?.nome || 'Leitor(a)',
    username: source?.username || '@usuario',
    email: String(source?.email || '').trim().toLowerCase(),
    bio: source?.bio || source?.biography || '',
    profilePicture: source?.profilePicture || source?.profile_picture || '',
    stats: source?.stats || {
      livrosLidos: 0,
      favoritos: 0,
      resenhas: 0,
    },
    destaque: Array.isArray(source?.destaque) ? source.destaque : [],
    categorias: Array.isArray(source?.categorias) ? source.categorias : [],
    atividade: Array.isArray(source?.atividade) ? source.atividade : [],
  };
}

export async function getUserProfile() {
  if (USE_MOCK_DATA) {
    return normalizeProfile(mockProfileStore);
  }

  try {
    const response = await api.get('/api/v1/users/me');
    return normalizeProfile(response.data);
  } catch (error) {
    throw error;
  }
}

export async function updateUserProfile(profileData) {
  const updatePayload = {
    nome: profileData?.name || profileData?.nome || '',
    email: String(profileData?.email || '').trim().toLowerCase(),
    biography: profileData?.bio || profileData?.biography || '',
    profilePicture: profileData?.profilePicture || profileData?.profile_picture || '',
  };

  if (USE_MOCK_DATA) {
    mockProfileStore = {
      ...mockProfileStore,
      name: updatePayload.nome,
      email: updatePayload.email,
      bio: updatePayload.biography,
      profilePicture: updatePayload.profilePicture,
    };
    return normalizeProfile(mockProfileStore);
  }

  try {
    const response = await api.put('/api/v1/users/me', updatePayload);
    const normalized = normalizeProfile(response.data);
    return normalized;
  } catch (error) {
    throw error;
  }
}

export async function changePassword(currentPassword, newPassword) {
  const payload = {
    senhaAtual: currentPassword,
    senhaNova: newPassword,
  };

  if (USE_MOCK_DATA) {
    // Mock validation: simple check that new password is different
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Nova senha deve ter no mínimo 6 caracteres');
    }
    // In mock mode, just return success
    return { success: true, message: 'Senha alterada com sucesso' };
  }

  try {
    const response = await api.post('/api/v1/users/change-password', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getUserStats() {
  if (USE_MOCK_DATA) {
    return {
      livrosLidos: mockProfileStore.stats?.livrosLidos || 0,
      favoritos: mockProfileStore.stats?.favoritos || 0,
      resenhas: mockProfileStore.stats?.resenhas || 0,
    };
  }

  try {
    const response = await api.get('/api/v1/users/me/stats');
    return response.data?.item || response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateProfilePicture(imageUri) {
  if (!imageUri) {
    throw new Error('Image URI é obrigatório');
  }

  if (USE_MOCK_DATA) {
    mockProfileStore = {
      ...mockProfileStore,
      profilePicture: imageUri,
    };
    return normalizeProfile(mockProfileStore);
  }

  try {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });

    const response = await api.post('/api/v1/users/me/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return normalizeProfile(response.data);
  } catch (error) {
    throw error;
  }
}

export async function addCategoryPreference(categoryName) {
  if (USE_MOCK_DATA) {
    if (!mockProfileStore.categorias) {
      mockProfileStore.categorias = [];
    }
    if (!mockProfileStore.categorias.includes(categoryName)) {
      mockProfileStore.categorias.push(categoryName);
    }
    return normalizeProfile(mockProfileStore);
  }

  try {
    const response = await api.post('/api/v1/users/me/categories', {
      nome: categoryName,
    });
    return normalizeProfile(response.data);
  } catch (error) {
    throw error;
  }
}

export async function removeCategoryPreference(categoryName) {
  if (USE_MOCK_DATA) {
    if (mockProfileStore.categorias) {
      mockProfileStore.categorias = mockProfileStore.categorias.filter(
        c => c !== categoryName
      );
    }
    return normalizeProfile(mockProfileStore);
  }

  try {
    const response = await api.delete(`/api/v1/users/me/categories/${categoryName}`);
    return normalizeProfile(response.data);
  } catch (error) {
    throw error;
  }
}
