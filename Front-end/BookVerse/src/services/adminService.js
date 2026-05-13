import api from './api';
import { MOCK_ADMIN_MEMBERS, MOCK_ADMIN_MODERATION } from '../mocks';

const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

const mockMembersStore = JSON.parse(JSON.stringify(MOCK_ADMIN_MEMBERS));
const mockModerationStore = JSON.parse(JSON.stringify(MOCK_ADMIN_MODERATION));

function normalizeMember(member = {}, index = 0) {
	const backendRole = (member.role || '').toUpperCase();
	let role = 'member';
	if (backendRole === 'ADMIN') role = 'admin';
	else if (backendRole === 'MODERATOR' || member.role === 'moderator') role = 'moderator';

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
		id: Number(item.id ?? index + 1),
		bookTitle: item.bookTitle || 'Livro',
		chapterTitle: item.chapterTitle || 'Capitulo',
		author: item.author || 'Leitor(a)',
		date: item.date || '2026-01-01',
		text: item.text || '',
		reason: item.reason || 'Analise manual',
		status,
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
	if (USE_MOCK_DATA) {
		return filterMembers(mockMembersStore.map(normalizeMember), params);
	}

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
	const normalizedId = Number(memberId);
	const status = nextStatus === 'blocked' ? 'blocked' : 'active';

	if (USE_MOCK_DATA) {
		const index = mockMembersStore.findIndex((member) => Number(member.id) === normalizedId);
		if (index < 0) return null;
		mockMembersStore[index].status = status;
		return normalizeMember(mockMembersStore[index], index);
	}

	// Backend does not expose a status endpoint yet; return optimistic update only
	return { id: normalizedId, status };
}

export async function updateAdminMemberRole(memberId, nextRole) {
	const normalizedId = Number(memberId);
	const role = nextRole === 'moderator' ? 'moderator' : 'member';
	const backendRole = nextRole === 'admin' ? 'ADMIN' : 'USER';

	if (USE_MOCK_DATA) {
		const index = mockMembersStore.findIndex((member) => Number(member.id) === normalizedId);
		if (index < 0) return null;
		mockMembersStore[index].role = role;
		return normalizeMember(mockMembersStore[index], index);
	}

	try {
		const response = await api.put(`/api/v1/users/${memberId}`, { role: backendRole });
		return normalizeMember(response.data || { id: memberId, role: backendRole });
	} catch (error) {
		throw error;
	}
}

export async function getModerationItems(params = {}) {
	if (USE_MOCK_DATA) {
		return filterModeration(mockModerationStore.map(normalizeModerationItem), params);
	}

	// Backend does not expose a moderation endpoint yet
	return [];
}

export async function setModerationStatus(itemId, nextStatus) {
	const normalizedId = Number(itemId);
	const status = ['pending', 'approved', 'rejected'].includes(nextStatus)
		? nextStatus
		: 'pending';

	if (USE_MOCK_DATA) {
		const index = mockModerationStore.findIndex((item) => Number(item.id) === normalizedId);
		if (index < 0) return null;
		mockModerationStore[index].status = status;
		return normalizeModerationItem(mockModerationStore[index], index);
	}

	// Backend does not expose a moderation endpoint yet
	return null;
}

// Mock store for dashboard
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
	if (USE_MOCK_DATA) {
		return {
			item: normalizeDashboard(mockDashboardStore),
		};
	}

	try {
		const response = await api.get('/api/v1/admin/dashboard');
		return {
			item: normalizeDashboard(response.data?.item || response.data),
		};
	} catch (error) {
		throw error;
	}
}
