import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Camada central de acesso à API.
// Tecnologias utilizadas: Axios, Expo Constants e Platform.
// Objetivo: resolver a URL base, anexar token e tratar renovação de sessão.
// Observações: centralizar essa lógica evita duplicação e mantém o tratamento de 401 consistente.

// Extrai apenas o host de uma URL ou string de host.
// Tecnologias utilizadas: manipulação de string e regex simples.
// Objetivo: normalizar a origem para comparar localhost, IP e host do Expo.
// Observações: remove protocolo e porta para reduzir variações de ambiente.
function extractHost(value) {
	const raw = String(value || '').trim();
	if (!raw) {
		return '';
	}

	const withoutScheme = raw.replace(/^[a-z]+:\/\//i, '');
	const hostPort = withoutScheme.split('/')[0] || '';
	return (hostPort.split(':')[0] || '').trim();
}

// Verifica se o host representa uma origem local.
// Tecnologias utilizadas: comparação de strings.
// Objetivo: identificar quando o backend apontado é local e pode exigir fallback específico.
// Observações: cobre localhost e loopback IPv4/IPv6.
function isLocalhostHost(host) {
	return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

// Recupera o host exposto pelo ambiente do Expo.
// Tecnologias utilizadas: expo-constants e leitura defensiva de propriedades.
// Objetivo: descobrir o endereço acessível pelo app durante o desenvolvimento.
// Observações: suporta diferentes formatos de manifest do Expo.
function getExpoHost() {
	const hostUri =
		Constants.expoConfig?.hostUri ||
		Constants.manifest2?.extra?.expoClient?.hostUri ||
		Constants.manifest?.debuggerHost ||
		'';

	return extractHost(hostUri);
}

// Monta uma URL base de fallback por plataforma.
// Tecnologias utilizadas: Platform e template literals.
// Objetivo: garantir conexão local quando a variável de ambiente não está definida.
// Observações: Android usa 10.0.2.2 por causa do emulador.
function buildFallbackBaseUrl() {
	if (Platform.OS === 'web') {
		return 'http://localhost:8080';
	}
	const host = getExpoHost();

	if (host) {
		return `http://${host}:8080`;
	}

	if (Platform.OS === 'android') {
		return 'http://10.0.2.2:8080';
	}

	return 'http://localhost:8080';
}

// Resolve a URL base final usada pelo Axios.
// Tecnologias utilizadas: process.env, Expo host e fallback por plataforma.
// Objetivo: escolher a melhor origem para dev, web e dispositivos móveis.
// Observações: evita usar localhost no dispositivo quando há host do Expo disponível.
function resolveBaseUrl() {
	const envBaseUrl = String(process.env.EXPO_PUBLIC_API_URL || '').trim();
	if (!envBaseUrl) {
		return buildFallbackBaseUrl();
	}

	if (Platform.OS === 'web') {
		return envBaseUrl;
	}

	const envHost = extractHost(envBaseUrl);
	if (!isLocalhostHost(envHost)) {
		return envBaseUrl;
	}

	const expoHost = getExpoHost();
	if (expoHost) {
		return `http://${expoHost}:8080`;
	}

	return envBaseUrl;
}

export const BASE_URL = resolveBaseUrl();

// Expõe informações úteis para depuração de ambiente.
// Tecnologias utilizadas: Expo Constants e Platform.
// Objetivo: facilitar diagnóstico de URL resolvida e origem do app.
// Observações: não deve ser usado para lógica de produção.
export function debugApiInfo() {
	const hostUri =
		Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri || Constants.manifest?.debuggerHost || '';
	return {
		platform: Platform.OS,
		envBaseUrl: String(process.env.EXPO_PUBLIC_API_URL || '').trim(),
		expoHost: getExpoHost(),
		hostUri,
		resolvedBaseUrl: BASE_URL,
	};
}

// Log de diagnóstico em ambiente de desenvolvimento.
// Tecnologias utilizadas: console.debug e flag de dev do bundler.
// Objetivo: registrar a configuração resolvida sem interromper a execução.
// Observações: protegido por try/catch para não quebrar builds ou testes.
try {
	const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : (process.env.NODE_ENV !== 'production');
	if (isDev) {
		// eslint-disable-next-line no-console
		console.debug('[api] debugApiInfo:', debugApiInfo());
	}
} catch (e) {
	// ignore
}

// Estado interno da sessão da API.
// Tecnologias utilizadas: variáveis de módulo.
// Objetivo: armazenar token de acesso, refresh e flags de controle do fluxo.
// Observações: fica fora do React para ser compartilhado entre chamadas HTTP.
let authToken = null;
let refreshToken = null;
let unauthorizedHandler = null;
let sessionRefreshHandler = null;
let hasHandledUnauthorized = false;
let refreshPromise = null;

// Aplica uma sessão autenticada à camada de API.
// Tecnologias utilizadas: coercão para string e flags internas.
// Objetivo: habilitar chamadas autenticadas com Bearer token.
// Observações: limpa o estado de 401 para permitir nova tentativa de refresh.
export function applyApiSession(session) {
	authToken = session?.token ? String(session.token) : null;
	refreshToken = session?.refreshToken ? String(session.refreshToken) : null;
	hasHandledUnauthorized = false;
}

// Limpa a sessão atual da API.
// Tecnologias utilizadas: reset de variáveis de módulo.
// Objetivo: remover tokens após logout ou expiração definitiva.
// Observações: também cancela a promessa compartilhada de refresh.
export function clearApiSession() {
	authToken = null;
	refreshToken = null;
	refreshPromise = null;
	hasHandledUnauthorized = false;
}

// Registra um callback para tratar autenticação inválida.
// Tecnologias utilizadas: função callback opcional.
// Objetivo: permitir logout ou redirecionamento quando a sessão expira.
// Observações: handlers inválidos são descartados com segurança.
export function setUnauthorizedHandler(handler) {
	unauthorizedHandler = typeof handler === 'function' ? handler : null;
}

// Registra um callback para receber tokens renovados.
// Tecnologias utilizadas: função callback opcional.
// Objetivo: sincronizar a nova sessão com a camada de autenticação do app.
// Observações: o callback é executado de forma assíncrona e protegida.
export function setSessionRefreshHandler(handler) {
	sessionRefreshHandler = typeof handler === 'function' ? handler : null;
}

// Extrai par de tokens de respostas do backend.
// Tecnologias utilizadas: leitura defensiva de payloads.
// Objetivo: suportar diferentes formatos de resposta do endpoint de login/refresh.
// Observações: aceita item, accessToken e variações em snake_case.
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

// Trata acesso não autorizado apenas uma vez por ciclo de erro.
// Tecnologias utilizadas: flags internas e callback assíncrono.
// Objetivo: evitar múltiplos logouts ou alertas quando várias requisições falham juntas.
// Observações: limpa a sessão antes de notificar a camada superior.
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

// Renova o token de acesso usando o refresh token salvo.
// Tecnologias utilizadas: axios.post e extração de tokens.
// Objetivo: revalidar a sessão sem interromper o usuário quando o access token expira.
// Observações: atualiza também o refresh token se o backend devolver um novo par.
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

// Instância compartilhada do Axios usada pelo app.
// Tecnologias utilizadas: axios.create.
// Objetivo: centralizar baseURL e interceptors de autenticação.
// Observações: todo consumo de API deve passar por esta instância.
const api = axios.create({
	baseURL: BASE_URL,
});

// Interceptor de request para anexar o Bearer token.
// Tecnologias utilizadas: Axios interceptors.
// Objetivo: autenticar automaticamente as chamadas protegidas.
// Observações: remove o header quando não existe sessão ativa.
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

// Interceptor de response para renovação automática em 401.
// Tecnologias utilizadas: Axios interceptors, promessa compartilhada e retry request.
// Objetivo: renovar sessão e refazer a chamada original sem intervenção manual.
// Observações: evita loop infinito marcando requisições já reexecutadas.
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
