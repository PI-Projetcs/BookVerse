jest.mock('@react-native-async-storage/async-storage', () => {
	const store = {};

	return {
		getItem: jest.fn(async (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null)),
		setItem: jest.fn(async (key, value) => {
			store[key] = value;
		}),
		removeItem: jest.fn(async (key) => {
			delete store[key];
		}),
		__store: store,
	};
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearStoredSession, getStoredSession, setStoredSession } from '../services/sessionStorage';

describe('sessionStorage service', () => {
	beforeEach(async () => {
		await clearStoredSession();
		jest.clearAllMocks();
	});

	it('stores and restores a session object', async () => {
		const payload = { role: 'member', email: 'user@bookverse.com' };
		await setStoredSession(payload);

		expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
		const restored = await getStoredSession();
		expect(restored).toEqual(payload);
	});

	it('clears session and returns null afterward', async () => {
		await setStoredSession({ role: 'admin' });
		await clearStoredSession();

		expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
		const restored = await getStoredSession();
		expect(restored).toBeNull();
	});
});