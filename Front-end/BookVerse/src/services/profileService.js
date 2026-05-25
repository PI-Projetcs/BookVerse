import api from './api';

const isTestMode = process.env.NODE_ENV === 'test';

function createMockState() {
  return {
    id: 1,
    nome: 'Leitor(a)',
    email: 'leitor@bookverse.local',
    bio: '',
    profilePicture: '',
    stats: {
      livrosLidos: 0,
      favoritos: 0,
      resenhas: 0,
      conquistas: 0,
    },
    destaque: [],
    categorias: [],
    atividade: [],
    favoriteBooks: [],
    readBooks: [],
    ratings: [],
    achievements: [],
    achievementsCatalog: [
      { id: 101, nome: 'Leitor iniciante', descricao: 'Leia 1 livro', criteriaType: 'READ_BOOKS', targetValue: 1, ativo: true },
      { id: 102, nome: 'Maratona de leitura', descricao: 'Leia 10 livros', criteriaType: 'READ_BOOKS', targetValue: 10, ativo: true },
      { id: 103, nome: 'Crítico ativo', descricao: 'Faça 5 avaliações', criteriaType: 'RATINGS_CREATED', targetValue: 5, ativo: true },
      { id: 104, nome: 'Guardião da estante', descricao: 'Salve 3 livros favoritos', criteriaType: 'FAVORITES_ADDED', targetValue: 3, ativo: true },
    ],
    feedbacks: [],
    role: 'member',
  };
}

let mockState = createMockState();

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBook(book = {}) {
  return {
    id: book?.id ?? null,
    title: book?.titulo || book?.title || 'Livro',
    author: book?.autor || book?.author || '',
    genre: book?.genero || book?.genre || '',
    coverUrl: book?.coverUrl || book?.cover_url || '',
    rating: toNumber(book?.mediaAvaliacao ?? book?.media_avaliacao, 0),
  };
}

function normalizeReading(reading = {}) {
  return {
    id: reading?.id ?? null,
    status: reading?.status || 'UNKNOWN',
    progress: toNumber(reading?.progresso, 0),
    bookId: reading?.livroId ?? reading?.bookId ?? reading?.livro?.id ?? null,
    bookTitle: reading?.livroTitulo || reading?.bookTitle || reading?.livro?.titulo || '',
    bookAuthor: reading?.livroAutor || reading?.bookAuthor || reading?.livro?.autor || '',
  };
}

function normalizeRating(rating = {}) {
  return {
    id: rating?.id ?? null,
    note: toNumber(rating?.nota, 0),
    review: rating?.descricao || rating?.review || '',
    bookId: rating?.livroId ?? rating?.bookId ?? rating?.livro?.id ?? null,
    bookTitle: rating?.livroTitulo || rating?.bookTitle || rating?.livro?.titulo || '',
    userId: rating?.usuarioId ?? rating?.userId ?? rating?.usuario?.id ?? null,
    userName: rating?.usuarioNome || rating?.userName || rating?.usuario?.nome || '',
    status: rating?.status || 'PENDING',
    moderatedAt: rating?.moderatedAt || null,
    adminFeedback: rating?.adminFeedback || '',
  };
}

function normalizeAchievement(achievement = {}) {
  return {
    id: achievement?.id ?? null,
    name: achievement?.nome || achievement?.name || 'Conquista',
    description: achievement?.descricao || achievement?.description || '',
    criteriaType: achievement?.criteriaType || achievement?.criteria_type || null,
    targetValue: toNumber(achievement?.targetValue ?? achievement?.target_value, 0),
    active: achievement?.ativo ?? achievement?.active ?? true,
  };
}

function syncMockStats() {
  mockState.stats = {
    livrosLidos: mockState.readBooks.length,
    favoritos: mockState.favoriteBooks.length,
    resenhas: mockState.ratings.length,
    conquistas: mockState.achievements.length,
  };
  mockState.destaque = [...mockState.favoriteBooks];
  mockState.atividade = [...mockState.readBooks.slice(0, 5)];
}

function getMockProfile() {
  syncMockStats();
  return normalizeProfile(mockState);
}

function normalizeProfile(payload = {}) {
  const source = payload?.item || payload;
  const usuario = source?.usuario || source?.user || source;

  const favoriteBooks = Array.isArray(source?.livrosFavoritos)
    ? source.livrosFavoritos.map(normalizeBook)
    : Array.isArray(source?.favoriteBooks)
      ? source.favoriteBooks.map(normalizeBook)
      : [];

  const readBooks = Array.isArray(source?.livrosLidos)
    ? source.livrosLidos.map(normalizeReading)
    : Array.isArray(source?.readBooks)
      ? source.readBooks.map(normalizeReading)
      : [];

  const ratings = Array.isArray(source?.avaliacoes)
    ? source.avaliacoes.map(normalizeRating)
    : Array.isArray(source?.ratings)
      ? source.ratings.map(normalizeRating)
      : [];

  const feedbacks = Array.isArray(source?.feedbacks)
    ? source.feedbacks.map(normalizeRating)
    : [];

  const achievements = Array.isArray(source?.conquistas)
    ? source.conquistas.map(normalizeAchievement)
    : Array.isArray(source?.achievements)
      ? source.achievements.map(normalizeAchievement)
      : [];

  const achievementsCatalog = Array.isArray(source?.achievementsCatalog)
    ? source.achievementsCatalog.map(normalizeAchievement)
    : Array.isArray(source?.catalogAchievements)
      ? source.catalogAchievements.map(normalizeAchievement)
      : Array.isArray(source?.allAchievements)
        ? source.allAchievements.map(normalizeAchievement)
        : [];

  const stats = source?.stats || {
    livrosLidos: readBooks.length,
    favoritos: favoriteBooks.length,
    resenhas: ratings.length,
    conquistas: achievements.length,
  };

  return {
    id: usuario?.id ?? null,
    name: usuario?.name || usuario?.nome || 'Leitor(a)',
    username: usuario?.username || `@${String(usuario?.nome || usuario?.name || 'usuario').toLowerCase().replace(/\s+/g, '')}`,
    email: String(usuario?.email || '').trim().toLowerCase(),
    bio: usuario?.bio || usuario?.biography || '',
    profilePicture: usuario?.profilePicture || usuario?.profile_picture || '',
    role: usuario?.role || null,
    stats,
    favoriteBooks,
    readBooks,
    ratings,
    achievements,
    achievementsCatalog,
    destaque: favoriteBooks,
    categorias: Array.isArray(source?.categorias) ? source.categorias : [],
    atividade: Array.isArray(source?.atividade) ? source.atividade : readBooks.slice(0, 5),
    feedbacks,
  };
}

export async function getUserProfile() {
  if (isTestMode) {
    return getMockProfile();
  }

  try {
    const response = await api.get('/api/v1/users/me/profile');
    return normalizeProfile(response.data);
  } catch (error) {
    throw error;
  }
}

export async function getDetailedUserProfile() {
  return getUserProfile();
}

export async function getUserFavorites() {
  if (isTestMode) {
    return getMockProfile().favoriteBooks;
  }

  try {
    const response = await api.get('/api/v1/users/me/favorites');
    return Array.isArray(response.data) ? response.data.map(normalizeBook) : [];
  } catch (error) {
    throw error;
  }
}

export async function addFavoriteBook(bookId) {
  if (isTestMode) {
    const parsedId = Number(bookId);
    if (!Number.isFinite(parsedId)) {
      throw new Error('bookId inválido');
    }

    const existing = mockState.favoriteBooks.find((item) => item.id === parsedId);
    if (!existing && mockState.favoriteBooks.length >= 3) {
      throw new Error('O perfil pode ter no máximo 3 livros favoritos.');
    }

    if (!existing) {
      mockState.favoriteBooks.push({
        id: parsedId,
        title: `Livro ${parsedId}`,
        author: 'Autor',
        genre: 'Gênero',
        coverUrl: '',
        rating: 0,
      });
    }

    return getMockProfile();
  }

  try {
    const response = await api.post(`/api/v1/users/me/favorites/${bookId}`);
    return normalizeProfile(response.data);
  } catch (error) {
    throw error;
  }
}

export async function removeFavoriteBook(bookId) {
  if (isTestMode) {
    const parsedId = Number(bookId);
    mockState.favoriteBooks = mockState.favoriteBooks.filter((item) => item.id !== parsedId);
    return getMockProfile();
  }

  try {
    const response = await api.delete(`/api/v1/users/me/favorites/${bookId}`);
    return normalizeProfile(response.data);
  } catch (error) {
    throw error;
  }
}

export async function getUserReadBooks() {
  if (isTestMode) {
    return getMockProfile().readBooks;
  }

  try {
    const response = await api.get('/api/v1/users/me/read-books');
    return Array.isArray(response.data) ? response.data.map(normalizeReading) : [];
  } catch (error) {
    throw error;
  }
}

export async function getUserRatings() {
  if (isTestMode) {
    return getMockProfile().ratings;
  }

  try {
    const response = await api.get('/api/v1/users/me/ratings');
    return Array.isArray(response.data) ? response.data.map(normalizeRating) : [];
  } catch (error) {
    throw error;
  }
}

export async function getUserAchievements() {
  if (isTestMode) {
    return getMockProfile().achievements;
  }

  try {
    const response = await api.get('/api/v1/users/me/achievements');
    return Array.isArray(response.data) ? response.data.map(normalizeAchievement) : [];
  } catch (error) {
    throw error;
  }
}

export async function getAchievementsCatalog() {
  if (isTestMode) {
    const profile = getMockProfile();
    const earnedIds = new Set(profile.achievements.map((item) => item.id));
    return mockState.achievementsCatalog.map((achievement) => {
      const normalized = normalizeAchievement(achievement);
      const currentValue = getAchievementProgressValue(profile, normalized);
      return {
        ...normalized,
        currentValue,
        completed: earnedIds.has(normalized.id) || currentValue >= normalized.targetValue,
      };
    });
  }

  try {
    const response = await api.get('/api/v1/achievements');
    return Array.isArray(response.data?.content)
      ? response.data.content.map(normalizeAchievement)
      : Array.isArray(response.data)
        ? response.data.map(normalizeAchievement)
        : [];
  } catch (error) {
    throw error;
  }
}

function getAchievementProgressValue(profile = {}, achievement = {}) {
  const criteriaType = String(achievement?.criteriaType || '').toUpperCase();
  if (criteriaType === 'READ_BOOKS') {
    return toNumber(profile?.stats?.livrosLidos ?? profile?.readBooks?.length, 0);
  }

  if (criteriaType === 'RATINGS_CREATED') {
    return toNumber(profile?.stats?.resenhas ?? profile?.ratings?.length, 0);
  }

  if (criteriaType === 'FAVORITES_ADDED') {
    return toNumber(profile?.stats?.favoritos ?? profile?.favoriteBooks?.length, 0);
  }

  return 0;
}

export async function updateUserProfile(profileData) {
  if (isTestMode) {
    mockState.nome = profileData?.name || profileData?.nome || mockState.nome;
    mockState.email = String(profileData?.email || mockState.email).trim().toLowerCase();
    mockState.bio = profileData?.bio || profileData?.biography || mockState.bio;
    mockState.profilePicture = profileData?.profilePicture || profileData?.profile_picture || mockState.profilePicture;
    return getMockProfile();
  }

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
  if (isTestMode) {
    if (!newPassword || String(newPassword).trim().length < 6) {
      throw new Error('A nova senha deve ter no mínimo 6 caracteres.');
    }

    return {
      success: true,
      message: 'Senha alterada com sucesso.',
    };
  }

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
  if (isTestMode) {
    return getMockProfile().stats;
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

  if (isTestMode) {
    mockState.profilePicture = imageUri;
    return getMockProfile();
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
  if (isTestMode) {
    const normalized = String(categoryName || '').trim();
    if (normalized && !mockState.categorias.includes(normalized)) {
      mockState.categorias = [...mockState.categorias, normalized];
    }

    return getMockProfile();
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
  if (isTestMode) {
    const normalized = String(categoryName || '').trim();
    mockState.categorias = mockState.categorias.filter((item) => item !== normalized);
    return getMockProfile();
  }

  try {
    const response = await api.delete(`/api/v1/users/me/categories/${categoryName}`);
    return normalizeProfile(response.data);
  } catch (error) {
    throw error;
  }
}

export async function deactivateOwnAccount() {
  if (isTestMode) {
    return { success: true };
  }

  try {
    await api.delete('/api/v1/users/me');
    return { success: true };
  } catch (error) {
    throw error;
  }
}
