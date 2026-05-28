import api from './api';
// Serviço admin utiliza APIs do backend via Axios

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

export async function updateAdminMemberStatus(memberId, nextStatus) {
	const status = nextStatus === 'blocked' ? 'blocked' : 'active';
	try {
		const response = await api.put(`/api/v1/users/${memberId}/status`, { status });
		return normalizeMember(response.data || { id: memberId, status });
	} catch (error) {
		throw error;
	}
}

export async function promoteAdminMember(memberId) {
	try {
		const response = await api.post(`/api/v1/admin/users/${memberId}/promote`);
		return normalizeMember(response.data || { id: memberId, role: 'ADMIN' });
	} catch (error) {
		throw error;
	}
}

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

export async function approveComment(commentId) {
	try {
		const response = await api.post(`/api/v1/admin/comments-moderation/comments/${encodeURIComponent(String(commentId))}/approve`);
		return normalizeModerationItem(response.data || { id: commentId, status: 'approved' });
	} catch (error) {
		throw error;
	}
}

export async function rejectComment(commentId, feedback) {
	try {
		const response = await api.post(`/api/v1/admin/comments-moderation/comments/${encodeURIComponent(String(commentId))}/reject`, { feedback });
		return normalizeModerationItem(response.data || { id: commentId, status: 'rejected' });
	} catch (error) {
		throw error;
	}
}

export async function approveRating(ratingId) {
	try {
		const response = await api.post(`/api/v1/admin/comments-moderation/ratings/${encodeURIComponent(String(ratingId))}/approve`);
		return normalizeModerationItem(response.data || { id: ratingId, status: 'approved', type: 'rating' });
	} catch (error) {
		throw error;
	}
}

export async function rejectRating(ratingId, feedback) {
	try {
		const response = await api.post(`/api/v1/admin/comments-moderation/ratings/${encodeURIComponent(String(ratingId))}/reject`, { feedback });
		return normalizeModerationItem(response.data || { id: ratingId, status: 'rejected', type: 'rating' });
	} catch (error) {
		throw error;
	}
}

// Armazenamento simulado para o dashboard
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

export async function deleteAchievement(achievementId) {
	try {
		await api.delete(`/api/v1/achievements/${achievementId}`);
		return { success: true };
	} catch (error) {
		throw error;
	}
}

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
