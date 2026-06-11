import AsyncStorage from '@react-native-async-storage/async-storage';

// Adaptador de persistência da sessão do usuário.
// Tecnologias utilizadas: AsyncStorage e JSON.
// Objetivo: salvar, ler e remover a sessão de forma centralizada.
// Observações: o módulo retorna valores simples para facilitar o tratamento na UI.

// Chave única usada para armazenar a sessão no dispositivo.
// Tecnologias utilizadas: constante local de configuração.
// Objetivo: evitar duplicação de string espalhada pelo app.
// Observações: manter a chave centralizada reduz risco de inconsistência entre telas.
const SESSION_KEY = '@bookverse/session';

// Lê a sessão salva no armazenamento local.
// Tecnologias utilizadas: AsyncStorage.getItem e JSON.parse.
// Objetivo: restaurar o usuário logado ao abrir o app.
// Observações: retorna null quando não houver sessão ou quando a leitura falhar.
export async function getStoredSession() {
	try {
		const raw = await AsyncStorage.getItem(SESSION_KEY);
		if (!raw) {
			return null;
		}

		return JSON.parse(raw);
	} catch (error) {
		return null;
	}
}

// Persiste a sessão do usuário no dispositivo.
// Tecnologias utilizadas: AsyncStorage.setItem e JSON.stringify.
// Objetivo: manter a autenticação após fechar e reabrir o app.
// Observações: retorna booleano para simplificar o fluxo de confirmação.
export async function setStoredSession(session) {
	try {
		await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
		return true;
	} catch (error) {
		return false;
	}
}

// Remove a sessão salva no dispositivo.
// Tecnologias utilizadas: AsyncStorage.removeItem.
// Objetivo: limpar credenciais locais após logout ou expiração.
// Observações: retorna booleano para indicar se a limpeza foi concluída.
export async function clearStoredSession() {
	try {
		await AsyncStorage.removeItem(SESSION_KEY);
		return true;
	} catch (error) {
		return false;
	}
}
