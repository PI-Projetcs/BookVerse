jest.mock('../services/api', () => ({
	__esModule: true,
	default: {
		post: jest.fn(),
	},
}));

import api from '../services/api';
import { loginUser, normalizeSessionPayload, registerUser } from '../services/authService';

describe('authService workflows', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('normalizes backend login payload into app session format', async () => {
		api.post.mockResolvedValueOnce({
			data: {
				item: {
					user: {
						id: 7,
						name: 'Rita',
						email: 'RITA@BOOKVERSE.COM',
						role: 'member',
					},
					token: 'jwt-token',
				},
			},
		});

		await expect(loginUser({ email: 'rita@bookverse.com', password: '123456' })).resolves.toMatchObject({
			id: 7,
			name: 'Rita',
			email: 'rita@bookverse.com',
			role: 'member',
			token: 'jwt-token',
		});
	});

	it('propagates network errors when backend is unavailable', async () => {
		api.post.mockRejectedValueOnce(new Error('Network Error'));

		await expect(loginUser({ email: 'admin@bookverse.com', password: 'admin123' })).rejects.toThrow('Network Error');
	});

	it('throws backend auth errors instead of silently authenticating', async () => {
		api.post.mockRejectedValueOnce({ response: { status: 401 } });

		await expect(loginUser({ email: 'user@bookverse.com', password: 'wrong' })).rejects.toEqual(
			expect.objectContaining({ response: { status: 401 } })
		);
	});

	it('normalizes register responses with token', async () => {
		api.post.mockResolvedValueOnce({
			data: {
				item: {
					user: {
						id: 11,
						name: 'Nova Leitura',
						email: 'nova@bookverse.com',
						role: 'member',
					},
					token: 'register-token',
				},
			},
		});

		await expect(
			registerUser({
				name: 'Nova Leitura',
				email: 'nova@bookverse.com',
				password: '123456',
				passwordConfirmation: '123456',
			})
		).resolves.toMatchObject({
			id: 11,
			token: 'register-token',
		});
	});

	it('can normalize direct payloads without item envelope', () => {
		expect(
			normalizeSessionPayload({
				user: { id: 2, name: 'Teste', email: 'TESTE@BOOKVERSE.COM', role: 'admin' },
				token: 'token',
			})
		).toMatchObject({
			id: 2,
			email: 'teste@bookverse.com',
			role: 'admin',
			token: 'token',
		});
	});
});