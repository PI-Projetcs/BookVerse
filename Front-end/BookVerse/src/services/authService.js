import api from './api';

function normalizeRole(roleValue) {
	const normalized = String(roleValue || '')
		.trim()
		.toUpperCase();

	if (normalized === 'ADMIN' || normalized === 'ROLE_ADMIN') {
		return 'admin';
	}

	return 'member';
}

function mapLoginPayload(credentials = {}) {
	return {
		email: String(credentials?.email || '').trim().toLowerCase(),
		senha: credentials?.senha || credentials?.password || '',
	};
}

function mapRegistrationPayload(payload = {}) {
	return {
		nome: payload?.nome || payload?.name || '',
		email: String(payload?.email || '').trim().toLowerCase(),
		senha: payload?.senha || payload?.password || '',
	};
}

function normalizeSessionPayload(payload = {}) {
	const source = payload?.item || payload;
	const user = source?.user || source;
	const token = source?.token || source?.accessToken || payload?.token || payload?.accessToken || null;
	const refreshToken =
		source?.refreshToken || source?.refresh_token || payload?.refreshToken || payload?.refresh_token || null;

	return {
		id: user?.id ?? null,
		name: user?.name || user?.nome || 'Leitor(a)',
		email: String(user?.email || '').trim().toLowerCase(),
		role: normalizeRole(user?.role),
		token: token ? String(token) : null,
		refreshToken: refreshToken ? String(refreshToken) : null,
		lastLoginAt: new Date().toISOString(),
	};
}

export async function loginUser(credentials) {
	const requestPayload = mapLoginPayload(credentials);

	try {
		const response = await api.post('/api/v1/auth/login', requestPayload);
		return normalizeSessionPayload(response.data);
	} catch (error) {
		throw error;
	}
}

export async function registerUser(payload) {
	const requestPayload = mapRegistrationPayload(payload);

	try {
		const response = await api.post('/api/v1/auth/register', requestPayload);
		const normalized = normalizeSessionPayload(response.data);

		if (normalized?.token) {
			return normalized;
		}

		return loginUser({ email: requestPayload.email, senha: requestPayload.senha });
	} catch (error) {
		throw error;
	}
}

export async function getUserProfile() {
	try {
		const response = await api.get('/api/v1/users/me');
		return normalizeSessionPayload(response.data);
	} catch (error) {
		throw error;
	}
}

export { normalizeSessionPayload };
