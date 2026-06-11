import api from './api';

// Serviço de perfil do BookVerse.
// Tecnologias utilizadas: Axios via api, funções puras de normalização e estado mock local.
// Objetivo: centralizar favoritos, leituras, avaliações, conquistas e dados da conta.
// Observações: suporta modo de teste sem backend e adapta nomes de campos do servidor.

// Indica quando o serviço deve operar em modo mock.
// Tecnologias utilizadas: variável de ambiente do Node.
// Objetivo: permitir desenvolvimento e testes sem depender da API real.
// Observações: o comportamento mockado afeta apenas este módulo.
const isTestMode = process.env.NODE_ENV === 'test';

// Cria um estado inicial simulado para o perfil.
// Tecnologias utilizadas: objeto literal e listas estáticas.
// Objetivo: fornecer dados mínimos para a UI funcionar em testes locais.
// Observações: o catálogo de conquistas mockado ajuda a validar progresso e badges.
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

// Converte valores em número com fallback seguro.
// Tecnologias utilizadas: Number e Number.isFinite.
// Objetivo: evitar cálculos quebrados em métricas do perfil.
// Observações: retorna o fallback quando o valor não é numérico.
function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// Normaliza livros favoritos para a UI.
// Tecnologias utilizadas: leitura defensiva de campos e fallback de texto.
// Objetivo: exibir livros favoritos com título, autor, gênero e capa consistentes.
// Observações: aceita chaves em português e inglês.
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

// Normaliza registros de leitura do usuário.
// Tecnologias utilizadas: Number e fallback de campos legados.
// Objetivo: mostrar livros lidos e progresso em uma forma previsível.
// Observações: preserva status para a tela de histórico.
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

// Normaliza avaliações feitas pelo usuário.
// Tecnologias utilizadas: coerção numérica e fallback de metadados.
// Objetivo: apresentar nota, resenha e status de moderação.
// Observações: inclui feedback do admin quando a avaliação foi rejeitada.
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

// Normaliza conquistas para o formato usado no perfil.
// Tecnologias utilizadas: Number e fallback de campos localizados.
// Objetivo: mostrar badges e progresso de forma uniforme.
// Observações: o campo active preserva itens desativados no catálogo.
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

// Sincroniza métricas derivadas do estado mock.
// Tecnologias utilizadas: arrays e atribuição de objeto.
// Objetivo: manter stats, destaque e atividade alinhados aos dados simulados.
// Observações: roda após alterações em favoritos ou leituras no modo de teste.
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

// Retorna o perfil simulado já normalizado.
// Tecnologias utilizadas: syncMockStats e normalizeProfile.
// Objetivo: alimentar a UI em modo de teste com um objeto único.
// Observações: útil para desenvolvimento sem backend ativo.
function getMockProfile() {
  syncMockStats();
  return normalizeProfile(mockState);
}

// Normaliza o perfil retornado pelo backend.
// Tecnologias utilizadas: leitura defensiva de payloads e mapeamento de listas.
// Objetivo: converter o contrato da API em dados prontos para as telas do perfil.
// Observações: suporta item, usuario/user e múltiplas variantes de coleção.
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

// Busca o perfil do usuário autenticado.
// Tecnologias utilizadas: api.get e normalizeProfile.
// Objetivo: alimentar a tela de perfil com dados consistentes.
// Observações: em modo de teste, devolve dados mockados sem chamar o backend.
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

// Alias de conveniência para o perfil detalhado.
// Tecnologias utilizadas: reaproveitamento de função exportada.
// Objetivo: manter compatibilidade com telas que esperam um nome mais descritivo.
// Observações: hoje delega diretamente para getUserProfile.
export async function getDetailedUserProfile() {
  return getUserProfile();
}

// Busca os livros favoritos do usuário.
// Tecnologias utilizadas: api.get e normalizeBook.
// Objetivo: alimentar o carrossel de favoritos no perfil.
// Observações: em teste, retorna o recorte do estado mock.
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

// Adiciona um livro aos favoritos do usuário.
// Tecnologias utilizadas: api.post e mutação do estado mock.
// Objetivo: salvar um livro na lista pessoal de favoritos.
// Observações: em teste, limita o perfil a até 3 favoritos.
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

// Remove um livro dos favoritos.
// Tecnologias utilizadas: api.delete e atualização do estado mock.
// Objetivo: permitir limpar a lista de favoritos do perfil.
// Observações: em teste, a remoção é refletida imediatamente no estado local.
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

// Busca os livros lidos pelo usuário.
// Tecnologias utilizadas: api.get e normalizeReading.
// Objetivo: exibir o histórico de leitura no perfil.
// Observações: em modo de teste, devolve os dados simulados já normalizados.
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

// Busca as avaliações do usuário.
// Tecnologias utilizadas: api.get e normalizeRating.
// Objetivo: listar as últimas resenhas enviadas pelo usuário.
// Observações: a normalização mantém status e feedback do admin quando existirem.
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

// Busca as conquistas já desbloqueadas pelo usuário.
// Tecnologias utilizadas: api.get e normalizeAchievement.
// Objetivo: alimentar a seção de badges conquistados.
// Observações: em teste, usa o catálogo mockado para validação da UI.
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

// Busca o catálogo de conquistas disponível para o perfil.
// Tecnologias utilizadas: api.get, normalizeAchievement e cálculo de progresso.
// Objetivo: mostrar conquistas em andamento e concluídas.
// Observações: no modo de teste, calcula progresso com base no estado mockado.
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

// Calcula o progresso atual de uma conquista com base no perfil.
// Tecnologias utilizadas: leitura de stats e listas do perfil.
// Objetivo: estimar o quanto falta para desbloquear cada conquista.
// Observações: suporta critérios padrão sem depender de outra chamada à API.
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

// Atualiza os dados principais do perfil do usuário.
// Tecnologias utilizadas: api.put e mutação do estado mock.
// Objetivo: permitir edição de nome, email, bio e foto de perfil.
// Observações: o payload converte campos em inglês e português para o mesmo contrato.
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

// Altera a senha do usuário autenticado.
// Tecnologias utilizadas: api.post e validação local de senha mínima no modo teste.
// Objetivo: oferecer atualização segura de credenciais.
// Observações: em teste, não chama backend e devolve resposta previsível.
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

// Busca estatísticas resumidas do perfil.
// Tecnologias utilizadas: api.get e fallback para o estado mockado.
// Objetivo: alimentar os cards de resumo do perfil.
// Observações: o backend pode retornar item ou objeto direto.
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

// Atualiza a foto de perfil via upload multipart.
// Tecnologias utilizadas: FormData e api.post.
// Objetivo: permitir troca de avatar no perfil do usuário.
// Observações: valida a URI antes do upload para evitar requisições vazias.
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

// Adiciona uma categoria de preferência ao usuário.
// Tecnologias utilizadas: api.post e mutação de estado mock.
// Objetivo: registrar interesses para personalização do perfil.
// Observações: no modo de teste, evita duplicar categorias já salvas.
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

// Remove uma categoria de preferência do usuário.
// Tecnologias utilizadas: api.delete e mutação de estado mock.
// Objetivo: manter as preferências do perfil sob controle do usuário.
// Observações: o nome da categoria é enviado na URL para a API.
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

// Desativa a própria conta do usuário.
// Tecnologias utilizadas: api.delete.
// Objetivo: oferecer exclusão da conta diretamente pelo perfil.
// Observações: em teste, retorna sucesso imediato para validar o fluxo da UI.
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
