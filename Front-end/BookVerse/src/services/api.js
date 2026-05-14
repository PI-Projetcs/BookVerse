import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function buildFallbackBaseUrl() {
	if (Platform.OS === 'web') {
		return 'http://localhost:8080';
	}

	const hostUri =
		Constants.expoConfig?.hostUri ||
		Constants.manifest2?.extra?.expoClient?.hostUri ||
		Constants.manifest?.debuggerHost ||
		'';
	const host = String(hostUri).split(':')[0];

	if (host) {
		return `http://${host}:8080`;
	}

	if (Platform.OS === 'android') {
		return 'http://10.0.2.2:8080';
	}

	return 'http://localhost:8080';
}

const envBaseUrl = String(process.env.EXPO_PUBLIC_API_URL || '').trim();
export const BASE_URL = envBaseUrl || buildFallbackBaseUrl();

let authToken = null;
let refreshToken = null;
let unauthorizedHandler = null;
let sessionRefreshHandler = null;
let hasHandledUnauthorized = false;
let refreshPromise = null;

export function applyApiSession(session) {
	authToken = session?.token ? String(session.token) : null;
	refreshToken = session?.refreshToken ? String(session.refreshToken) : null;
	hasHandledUnauthorized = false;
}

export function clearApiSession() {
	authToken = null;
	refreshToken = null;
	refreshPromise = null;
	hasHandledUnauthorized = false;
}

export function setUnauthorizedHandler(handler) {
	unauthorizedHandler = typeof handler === 'function' ? handler : null;
}

export function setSessionRefreshHandler(handler) {
	sessionRefreshHandler = typeof handler === 'function' ? handler : null;
}

function extractTokenPair(payload = {}) {
	const source = payload?.item || payload;
	const nextToken = source?.token || source?.accessToken || source?.access_token || null;
	const nextRefreshToken =
		source?.refreshToken || source?.refresh_token || payload?.refreshToken || payload?.refresh_token || null;

	return {
		token: nextToken ? String(nextToken) : null,
		refreshToken: nextRefreshToken ? String(nextRefreshToken) : null,
	};
}

function handleUnauthorized(error) {
	if (hasHandledUnauthorized) {
		return;
	}

	clearApiSession();
	hasHandledUnauthorized = true;

	if (unauthorizedHandler) {
		Promise.resolve(unauthorizedHandler(error)).catch(() => null);
	}
}

async function refreshAccessToken() {
	if (!refreshToken) {
		throw new Error('Missing refresh token');
	}

	const response = await axios.post(`${BASE_URL}/auth/refresh`, {
		refreshToken,
	});

	const tokens = extractTokenPair(response.data);
	if (!tokens.token) {
		throw new Error('Refresh response is missing token');
	}

	authToken = tokens.token;
	if (tokens.refreshToken) {
		refreshToken = tokens.refreshToken;
	}
	hasHandledUnauthorized = false;

	if (sessionRefreshHandler) {
		Promise.resolve(sessionRefreshHandler(tokens)).catch(() => null);
	}

	return authToken;
}

const api = axios.create({
	baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
	const nextConfig = {
		...config,
		headers: {
			...(config.headers || {}),
		},
	};

	if (authToken) {
		nextConfig.headers.Authorization = `Bearer ${authToken}`;
	} else {
		delete nextConfig.headers.Authorization;
	}

	return nextConfig;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const isUnauthorized = error?.response?.status === 401;
		const originalRequest = error?.config || {};
		const requestUrl = String(originalRequest?.url || '');
		const isRefreshEndpoint = requestUrl.includes('/auth/refresh');

		if (!isUnauthorized) {
			return Promise.reject(error);
		}

		if (!authToken) {
			return Promise.reject(error);
		}

		if (isRefreshEndpoint || originalRequest.__isRetryRequest || !refreshToken) {
			handleUnauthorized(error);
			return Promise.reject(error);
		}

		try {
			if (!refreshPromise) {
				refreshPromise = refreshAccessToken().finally(() => {
					refreshPromise = null;
				});
			}

			const nextToken = await refreshPromise;
			const retriedRequest = {
				...originalRequest,
				__isRetryRequest: true,
				headers: {
					...(originalRequest.headers || {}),
					Authorization: `Bearer ${nextToken}`,
				},
			};

			return api.request(retriedRequest);
		} catch (refreshError) {
			handleUnauthorized(refreshError);
			return Promise.reject(error);
		}
	}
);

export default api;
