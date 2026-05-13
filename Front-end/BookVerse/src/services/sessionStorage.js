import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@bookverse/session';

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

export async function setStoredSession(session) {
	try {
		await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
		return true;
	} catch (error) {
		return false;
	}
}

export async function clearStoredSession() {
	try {
		await AsyncStorage.removeItem(SESSION_KEY);
		return true;
	} catch (error) {
		return false;
	}
}
