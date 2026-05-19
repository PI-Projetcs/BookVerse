import api from './api';

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

  try {
    const response = await api.put('/api/v1/users/me', updatePayload);
    return normalizeProfile(response.data);
  } catch (error) {
    throw error;
  }
}

export async function changePassword(currentPassword, newPassword) {
  const payload = {
    senhaAtual: currentPassword,
    senhaNova: newPassword,
  };

  try {
    const response = await api.post('/api/v1/users/change-password', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getUserStats() {
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
  try {
    const response = await api.delete(`/api/v1/users/me/categories/${categoryName}`);
    return normalizeProfile(response.data);
  } catch (error) {
    throw error;
  }
}

export async function deactivateOwnAccount() {
  try {
    await api.delete('/api/v1/users/me');
    return { success: true };
  } catch (error) {
    throw error;
  }
}
