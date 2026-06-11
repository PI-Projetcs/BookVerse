import api from './api';

// Serviço de autenticação do BookVerse.
// Tecnologias utilizadas: Axios via api e funções puras de mapeamento.
// Objetivo: centralizar login, cadastro e leitura do perfil autenticado.
// Observações: o serviço normaliza nomes de campos para reduzir dependência do backend.

// Normaliza o papel do usuário para o formato usado pelo frontend.
// Tecnologias utilizadas: manipulação de string.
// Objetivo: converter roles do backend em valores amigáveis para a UI.
// Observações: trata variações como ADMIN e ROLE_ADMIN como administrador.
function normalizeRole(roleValue) {
	const normalized = String(roleValue || '')
		.trim()
		.toUpperCase();

	if (normalized === 'ADMIN' || normalized === 'ROLE_ADMIN') {
		return 'admin';
	}

	return 'member';
}

// Mapeia os campos do login para o payload esperado pela API.
// Tecnologias utilizadas: objetos literais e normalização de texto.
// Objetivo: aceitar diferentes nomes de entrada sem duplicar lógica na tela.
// Observações: o email é padronizado para minúsculas antes do envio.
function mapLoginPayload(credentials = {}) {
	return {
		email: String(credentials?.email || '').trim().toLowerCase(),
		senha: credentials?.senha || credentials?.password || '',
	};
}

// Mapeia os campos do cadastro para o payload da API.
// Tecnologias utilizadas: objetos literais e fallback de aliases.
// Objetivo: aceitar name/nome e password/senha no mesmo fluxo.
// Observações: a normalização evita acoplamento da UI ao contrato exato do backend.
function mapRegistrationPayload(payload = {}) {
	return {
		nome: payload?.nome || payload?.name || '',
		email: String(payload?.email || '').trim().toLowerCase(),
		senha: payload?.senha || payload?.password || '',
	};
}

// Normaliza o payload de sessão retornado pela API.
// Tecnologias utilizadas: leitura defensiva de objetos e Date.
// Objetivo: transformar a resposta do backend em sessão pronta para uso no app.
// Observações: suporta payload aninhado em item e user, e gera lastLoginAt local.
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

// Executa login e devolve a sessão normalizada.
// Tecnologias utilizadas: api.post e normalizeSessionPayload.
// Objetivo: autenticar o usuário com um contrato único para o restante do app.
// Observações: erros originais são repassados para a camada de UI tratar mensagens.
export async function loginUser(credentials) {
	const requestPayload = mapLoginPayload(credentials);

	try {
		const response = await api.post('/api/v1/auth/login', requestPayload);
		return normalizeSessionPayload(response.data);
	} catch (error) {
		throw error;
	}
}

// Registra um novo usuário e, se necessário, faz login automaticamente.
// Tecnologias utilizadas: api.post, loginUser e normalizeSessionPayload.
// Objetivo: simplificar o fluxo de cadastro e iniciar a sessão do usuário.
// Observações: quando a API não retorna token, o serviço faz login com as credenciais enviadas.
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

// Busca o perfil autenticado do usuário logado.
// Tecnologias utilizadas: api.get e normalizeSessionPayload.
// Objetivo: fornecer dados de conta já prontos para as telas de perfil e sessão.
// Observações: reaproveita o mesmo normalizador para manter consistência com login e cadastro.
export async function getUserProfile() {
	try {
		const response = await api.get('/api/v1/users/me');
		return normalizeSessionPayload(response.data);
	} catch (error) {
		throw error;
	}
}

// Exporta o normalizador da sessão para reaproveitamento em outras camadas.
// Tecnologias utilizadas: função pura compartilhada.
// Objetivo: permitir que o frontend converta respostas de autenticação em um mesmo formato.
// Observações: evita duplicação de regras entre login, cadastro e perfil.
export { normalizeSessionPayload };
