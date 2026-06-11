import api from './api';

// Serviço administrativo do BookVerse.
// Tecnologias utilizadas: Axios via api, funções puras de normalização e filtros locais.
// Objetivo: centralizar chamadas do painel, moderação e conquistas em uma camada única.
// Observações: o serviço preserva erros originais para a UI decidir mensagens e fluxos.

// Normaliza dados de membros vindos do backend para o formato esperado pela UI.
// Tecnologias utilizadas: manipulação de objetos, Number e fallback de avatar.
// Objetivo: unificar nomes, papéis, status e métricas antes da renderização.
// Observações: o fallback reduz quebra visual quando o backend envia campos incompletos.
function normalizeMember(member = {}, index = 0) {
	const backendRole = (member.role || '').toUpperCase();
	const role = backendRole === 'ADMIN' || backendRole === 'ROLE_ADMIN' ? 'admin' : 'member';

	return {
		id: Number(member.id ?? index + 1),
		name: member.nome || member.name || 'Leitor(a)',
		email: member.email || 'email@bookverse.com',
		avatar: member.avatar || `https://i.pravatar.cc/120?img=${(index % 50) + 1}`,
		role,
		status: member.status === 'blocked' ? 'blocked' : 'active',
		joinedAt: member.joinedAt || member.dataCadastro || '2026-01-01',
		booksRead: Math.max(0, Number(member.booksRead) || 0),
	};
}

// Normaliza itens de moderação para comentários e avaliações.
// Tecnologias utilizadas: arrays, validação simples de status e fallback de textos.
// Objetivo: padronizar o formato da fila de moderação para a tela administrativa.
// Observações: a normalização evita ramificações de UI para respostas diferentes do backend.
function normalizeModerationItem(item = {}, index = 0) {
	const status = ['pending', 'approved', 'rejected'].includes(item.status)
		? item.status
		: 'pending';

	return {
		id: String(item.id ?? `comment-${index + 1}`),
		bookTitle: item.bookTitle || 'Livro',
		chapterTitle: item.chapterTitle || 'Capitulo',
		author: item.author || 'Leitor(a)',
		date: item.date || '',
		text: item.text || '',
		reason: item.reason || 'Analise manual',
		status,
		type: item.type || 'comment',
		rating: item.rating ?? null,
	};
}

// Normaliza conquistas retornadas pela API para o formato usado nas telas admin.
// Tecnologias utilizadas: compatibilidade com nomes em camelCase e snake_case.
// Objetivo: manter edição e listagem de conquistas consistentes na interface.
// Observações: também consolida critérios múltiplos em criteriaPairs para reaproveitamento.
function normalizeAchievement(item = {}, index = 0) {
	const criteriaPairs = [
		{ criteriaType: item.criteriaType || item.criteria_type, targetValue: Number(item.targetValue ?? item.target_value) || 1 },
		{ criteriaType: item.criteriaType2 || item.criteria_type2, targetValue: Number(item.targetValue2 ?? item.target_value2) || 1 },
		{ criteriaType: item.criteriaType3 || item.criteria_type3, targetValue: Number(item.targetValue3 ?? item.target_value3) || 1 },
	].filter((pair) => Boolean(pair.criteriaType));

	return {
		id: Number(item.id ?? index + 1),
		name: item.nome || item.name || 'Conquista',
		description: item.descricao || item.description || '',
		criteriaType: item.criteriaType || item.criteria_type || 'READ_BOOKS',
		targetValue: Number(item.targetValue ?? item.target_value) || 1,
		criteriaType2: item.criteriaType2 || item.criteria_type2 || null,
		targetValue2: Number(item.targetValue2 ?? item.target_value2) || null,
		criteriaType3: item.criteriaType3 || item.criteria_type3 || null,
		targetValue3: Number(item.targetValue3 ?? item.target_value3) || null,
		criteriaPairs,
		active: item.ativo ?? item.active ?? true,
	};
}

// Normaliza o progresso agregado das conquistas.
// Tecnologias utilizadas: Number e fallback seguro.
// Objetivo: exibir progresso por conquista em cards e resumos do painel.
// Observações: mantém a leitura estável mesmo quando o backend omite campos opcionais.
function normalizeAchievementProgress(item = {}, index = 0) {
	return {
		achievementId: Number(item.achievementId ?? item.achievement_id ?? index + 1),
		label: item.label || '',
		criteriaType: item.criteriaType || item.criteria_type || '',
		currentValue: Math.max(0, Number(item.currentValue ?? item.current_value) || 0),
		targetValue: Math.max(0, Number(item.targetValue ?? item.target_value) || 0),
		completed: Boolean(item.completed),
	};
}

// Filtra membros pelo texto pesquisado e pelo status escolhido.
// Tecnologias utilizadas: Array.filter e comparação textual case-insensitive.
// Objetivo: reduzir a lista visível sem depender de nova consulta ao servidor.
// Observações: o filtro local complementa a busca já enviada na API.
function filterMembers(items, { query = '', status = 'all' } = {}) {
	const text = String(query || '').trim().toLowerCase();
	return items.filter((member) => {
		const matchesStatus = status === 'all' || member.status === status;
		const matchesQuery =
			!text ||
			[member.name, member.email, member.role]
				.join(' ')
				.toLowerCase()
				.includes(text);
		return matchesStatus && matchesQuery;
	});
}

// Filtra itens de moderação por texto e status.
// Tecnologias utilizadas: Array.filter e normalização de string.
// Objetivo: manter a fila administrativa focada no tipo de item esperado.
// Observações: a busca considera autor, livro, capítulo, motivo e texto.
function filterModeration(items, { query = '', status = 'pending' } = {}) {
	const text = String(query || '').trim().toLowerCase();
	return items.filter((item) => {
		const matchesStatus = status === 'all' || item.status === status;
		const matchesQuery =
			!text ||
			[item.author, item.bookTitle, item.chapterTitle, item.reason, item.text]
				.join(' ')
				.toLowerCase()
				.includes(text);
		return matchesStatus && matchesQuery;
	});
}

// Busca membros administrativos e aplica o formato esperado pela UI.
// Tecnologias utilizadas: api.get e normalização local.
// Objetivo: alimentar a tela de gerenciamento de usuários com dados prontos para exibição.
// Observações: suporta respostas paginadas ou listas diretas do backend.
export async function getAdminMembers(params = {}) {
	try {
		const response = await api.get('/api/v1/users');
		const items = Array.isArray(response.data?.content)
			? response.data.content
			: Array.isArray(response.data)
				? response.data
				: [];
		const normalized = items.map(normalizeMember);
		return filterMembers(normalized, params);
	} catch (error) {
		throw error;
	}
}

// Atualiza o status de bloqueio/ativação de um membro.
// Tecnologias utilizadas: api.put e normalização de membro.
// Objetivo: permitir moderação direta de acesso sem sair da lista.
// Observações: o status é sanitizado antes do envio para evitar valores inválidos.
export async function updateAdminMemberStatus(memberId, nextStatus) {
	const status = nextStatus === 'blocked' ? 'blocked' : 'active';
	try {
		const response = await api.put(`/api/v1/users/${memberId}/status`, { status });
		return normalizeMember(response.data || { id: memberId, status });
	} catch (error) {
		throw error;
	}
}

// Promove um membro para administrador.
// Tecnologias utilizadas: api.post e normalização de membro.
// Objetivo: elevar permissões com uma ação administrativa direta.
// Observações: o fallback garante um papel admin mesmo quando a resposta é mínima.
export async function promoteAdminMember(memberId) {
	try {
		const response = await api.post(`/api/v1/admin/users/${memberId}/promote`);
		return normalizeMember(response.data || { id: memberId, role: 'ADMIN' });
	} catch (error) {
		throw error;
	}
}

// Busca a fila de moderação de comentários e avaliações.
// Tecnologias utilizadas: api.get com parâmetros de query e filtro local.
// Objetivo: carregar a lista usada nas telas de moderação do painel.
// Observações: o backend recebe status e busca textual para reduzir volume desnecessário.
export async function getModerationItems(params = {}) {
	try {
		const response = await api.get('/api/v1/admin/comments-moderation', {
			params: {
				status: params?.status || 'pending',
				query: params?.query || '',
			},
		});
		const items = Array.isArray(response.data?.content)
			? response.data.content
			: Array.isArray(response.data)
				? response.data
				: [];
		const normalized = items.map(normalizeModerationItem);
		return filterModeration(normalized, params);
	} catch (error) {
		throw error;
	}
}

// Atualiza o status de um item de moderação de forma genérica.
// Tecnologias utilizadas: api.post e encodeURIComponent.
// Objetivo: manter um ponto único para alterar estados pendente, aprovado ou rejeitado.
// Observações: o id é codificado para evitar problemas com caracteres especiais.
export async function setModerationStatus(itemId, nextStatus) {
	const status = ['pending', 'approved', 'rejected'].includes(nextStatus)
		? nextStatus
		: 'pending';
	try {
		const response = await api.post(`/api/v1/admin/comments-moderation/${encodeURIComponent(String(itemId))}/status`, { status });
		return normalizeModerationItem(response.data || { id: itemId, status });
	} catch (error) {
		throw error;
	}
}

// Aprova um comentário em moderação.
// Tecnologias utilizadas: api.post e normalização do item retornado.
// Objetivo: reduzir o comentário a um clique no fluxo administrativo.
// Observações: o retorno padronizado facilita atualizar a lista sem refetch completo.
export async function approveComment(commentId) {
	try {
		const response = await api.post(`/api/v1/admin/comments-moderation/comments/${encodeURIComponent(String(commentId))}/approve`);
		return normalizeModerationItem(response.data || { id: commentId, status: 'approved' });
	} catch (error) {
		throw error;
	}
}

// Rejeita um comentário e envia feedback ao autor.
// Tecnologias utilizadas: api.post e payload de feedback.
// Objetivo: permitir moderação com orientação explícita para o usuário.
// Observações: o feedback é opcional na API, mas útil para contexto e auditoria.
export async function rejectComment(commentId, feedback) {
	try {
		const response = await api.post(`/api/v1/admin/comments-moderation/comments/${encodeURIComponent(String(commentId))}/reject`, { feedback });
		return normalizeModerationItem(response.data || { id: commentId, status: 'rejected' });
	} catch (error) {
		throw error;
	}
}

// Aprova uma avaliação em moderação.
// Tecnologias utilizadas: api.post e normalização do retorno.
// Objetivo: liberar avaliações que passaram pela revisão do admin.
// Observações: o tipo 'rating' é preservado para a UI distinguir o conteúdo.
export async function approveRating(ratingId) {
	try {
		const response = await api.post(`/api/v1/admin/comments-moderation/ratings/${encodeURIComponent(String(ratingId))}/approve`);
		return normalizeModerationItem(response.data || { id: ratingId, status: 'approved', type: 'rating' });
	} catch (error) {
		throw error;
	}
}

// Rejeita uma avaliação com feedback de moderação.
// Tecnologias utilizadas: api.post e payload com justificativa.
// Objetivo: registrar a decisão e orientar o autor sobre a recusa.
// Observações: o serviço mantém o contrato de status rejeitado para a tela atualizar.
export async function rejectRating(ratingId, feedback) {
	try {
		const response = await api.post(`/api/v1/admin/comments-moderation/ratings/${encodeURIComponent(String(ratingId))}/reject`, { feedback });
		return normalizeModerationItem(response.data || { id: ratingId, status: 'rejected', type: 'rating' });
	} catch (error) {
		throw error;
	}
}

// Base simulada para o dashboard administrativo.
// Tecnologias utilizadas: objeto estático local.
// Objetivo: servir como fallback visual durante desenvolvimento ou ausência de API.
// Observações: o valor não é consumido diretamente quando o endpoint real responde.
const mockDashboardStore = {
	totalUsers: 245,
	totalBooks: 1250,
	totalDiscussions: 3847,
	pendingModerations: 12,
	activeUsers: 156,
	booksThisMonth: 87,
	discussionsThisMonth: 523,
	averageRating: 4.2,
};

// Normaliza os dados do dashboard administrativo.
// Tecnologias utilizadas: Number e fallback por campo alternativo.
// Objetivo: exibir métricas do painel em um formato previsível.
// Observações: aceita camelCase e snake_case para compatibilidade com o backend.
function normalizeDashboard(data = {}) {
	return {
		totalUsers: Number(data?.totalUsers ?? data?.total_users) || 0,
		totalBooks: Number(data?.totalBooks ?? data?.total_books) || 0,
		totalDiscussions: Number(data?.totalDiscussions ?? data?.total_discussions) || 0,
		pendingModerations: Number(data?.pendingModerations ?? data?.pending_moderations) || 0,
		activeUsers: Number(data?.activeUsers ?? data?.active_users) || 0,
		booksThisMonth: Number(data?.booksThisMonth ?? data?.books_this_month) || 0,
		discussionsThisMonth: Number(data?.discussionsThisMonth ?? data?.discussions_this_month) || 0,
		averageRating: Number(data?.averageRating ?? data?.average_rating) || 0,
	};
}

// Busca métricas gerais do painel administrativo.
// Tecnologias utilizadas: api.get e normalização de dashboard.
// Objetivo: alimentar cards e resumos da tela admin com indicadores consolidados.
// Observações: a resposta é embrulhada em item para manter um contrato estável.
export async function getAdminDashboard() {
	try {
		const response = await api.get('/api/v1/admin/dashboard');
		return {
			item: normalizeDashboard(response.data?.item || response.data),
		};
	} catch (error) {
		throw error;
	}
}

// Busca o catálogo de conquistas.
// Tecnologias utilizadas: api.get e normalizeAchievement.
// Objetivo: listar conquistas para edição, ativação e remoção.
// Observações: suporta resposta paginada e lista simples do backend.
export async function getAchievements() {
	try {
		const response = await api.get('/api/v1/achievements');
		const items = Array.isArray(response.data?.content)
			? response.data.content
			: Array.isArray(response.data)
				? response.data
				: [];
		return items.map(normalizeAchievement);
	} catch (error) {
		throw error;
	}
}

// Busca o progresso agregado das conquistas.
// Tecnologias utilizadas: api.get e normalizeAchievementProgress.
// Objetivo: mostrar barras, percentuais e contadores de progresso no painel.
// Observações: aceita tanto array direto quanto conteúdo aninhado em content.
export async function getAchievementProgress() {
	try {
		const response = await api.get('/api/v1/achievements/progress');
		const items = Array.isArray(response.data)
			? response.data
			: Array.isArray(response.data?.content)
				? response.data.content
				: [];
		return items.map(normalizeAchievementProgress);
	} catch (error) {
		throw error;
	}
}

// Cria uma conquista nova no backend.
// Tecnologias utilizadas: api.post e composição de criteriaPairs.
// Objetivo: persistir regras de conquista com um ou mais critérios.
// Observações: o payload aceita nomes legados e transforma o formato para o backend.
export async function createAchievement(payload = {}) {
	const criteriaPairs = Array.isArray(payload?.criteriaPairs) && payload.criteriaPairs.length > 0
		? payload.criteriaPairs
		: [
			{
				criteriaType: payload?.criteriaType || payload?.criteria_type || 'READ_BOOKS',
				targetValue: Number(payload?.targetValue ?? payload?.target_value) || 1,
			},
		];

	const [first, second, third] = criteriaPairs;

	try {
		const response = await api.post('/api/v1/achievements', {
			nome: payload?.name || payload?.nome || '',
			descricao: payload?.description || payload?.descricao || '',
			criteriaType: first?.criteriaType || 'READ_BOOKS',
			targetValue: Number(first?.targetValue) || 1,
			criteriaType2: second?.criteriaType || null,
			targetValue2: second ? Number(second?.targetValue) || 1 : null,
			criteriaType3: third?.criteriaType || null,
			targetValue3: third ? Number(third?.targetValue) || 1 : null,
			ativo: payload?.active ?? payload?.ativo ?? true,
		});
		return normalizeAchievement(response.data);
	} catch (error) {
		throw error;
	}
}

// Atualiza uma conquista existente.
// Tecnologias utilizadas: api.put e composição de criteriaPairs.
// Objetivo: alterar critérios, metas e estado ativo da conquista.
// Observações: reaproveita a mesma estrutura de criação para manter consistência.
export async function updateAchievement(achievementId, payload = {}) {
	const criteriaPairs = Array.isArray(payload?.criteriaPairs) && payload.criteriaPairs.length > 0
		? payload.criteriaPairs
		: [
			{
				criteriaType: payload?.criteriaType || payload?.criteria_type || 'READ_BOOKS',
				targetValue: Number(payload?.targetValue ?? payload?.target_value) || 1,
			},
		];

	const [first, second, third] = criteriaPairs;

	try {
		const response = await api.put(`/api/v1/achievements/${achievementId}`, {
			nome: payload?.name || payload?.nome || '',
			descricao: payload?.description || payload?.descricao || '',
			criteriaType: first?.criteriaType || 'READ_BOOKS',
			targetValue: Number(first?.targetValue) || 1,
			criteriaType2: second?.criteriaType || null,
			targetValue2: second ? Number(second?.targetValue) || 1 : null,
			criteriaType3: third?.criteriaType || null,
			targetValue3: third ? Number(third?.targetValue) || 1 : null,
			ativo: payload?.active ?? payload?.ativo ?? true,
		});
		return normalizeAchievement(response.data);
	} catch (error) {
		throw error;
	}
}

// Remove uma conquista do catálogo.
// Tecnologias utilizadas: api.delete.
// Objetivo: excluir itens administrativos sem manter estado local adicional.
// Observações: retorna um objeto de sucesso para padronizar o fluxo de chamada.
export async function deleteAchievement(achievementId) {
	try {
		await api.delete(`/api/v1/achievements/${achievementId}`);
		return { success: true };
	} catch (error) {
		throw error;
	}
}

// Normaliza estatísticas agregadas de conquistas.
// Tecnologias utilizadas: Number e fallback de campos alternativos.
// Objetivo: preparar porcentagens e contagens para cards e relatórios.
// Observações: a leitura uniforme evita lógica duplicada na UI.
function normalizeAchievementAggregate(item = {}) {
	return {
		achievementId: Number(item.achievementId ?? item.achievement_id) || null,
		label: item.label || item.nome || item.name || '',
		criteriaType: item.criteriaType || item.criteria_type || '',
		usersMeetingCount: Number(item.usersMeetingCount ?? item.users_meeting_count) || 0,
		totalUsers: Number(item.totalUsers ?? item.total_users) || 0,
		percentage: Number(item.percentage ?? item.percentagem ?? 0) || 0,
	};
}

// Busca métricas agregadas das conquistas.
// Tecnologias utilizadas: api.get e normalizeAchievementAggregate.
// Objetivo: mostrar quantos usuários atingiram cada conquista.
// Observações: o retorno é mapeado para simplificar o uso no painel.
export async function getAchievementsAggregate() {
	try {
		const response = await api.get('/api/v1/achievements/aggregate');
		const items = Array.isArray(response.data)
			? response.data
			: Array.isArray(response.data?.content)
				? response.data.content
				: [];
		return items.map(normalizeAchievementAggregate);
	} catch (error) {
		throw error;
	}
}
