jest.mock('axios', () => {
	const client = {
		request: jest.fn(),
		interceptors: {
			request: { use: jest.fn() },
			response: { use: jest.fn() },
		},
	};

	const create = jest.fn(() => ({
		...client,
	}));
	const post = jest.fn();

	return {
		__esModule: true,
		default: { create, post },
		create,
		post,
	};
});

describe('api auth handling', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	it('adds and removes Authorization header based on active session token', async () => {
		const apiModule = require('../services/api');
		const axios = require('axios');
		const client = axios.create.mock.results[0].value;
		const requestInterceptor = client.interceptors.request.use.mock.calls[0][0];

		apiModule.applyApiSession({ token: 'jwt-123' });
		expect(requestInterceptor({ headers: {} })).toMatchObject({
			headers: { Authorization: 'Bearer jwt-123' },
		});

		apiModule.clearApiSession();
		expect(requestInterceptor({ headers: { Authorization: 'Bearer stale' } })).toMatchObject({
			headers: {},
		});
	});

	it('calls the unauthorized handler once and clears token on 401 responses', async () => {
		const apiModule = require('../services/api');
		const axios = require('axios');
		const client = axios.create.mock.results[0].value;
		const requestInterceptor = client.interceptors.request.use.mock.calls[0][0];
		const responseErrorInterceptor = client.interceptors.response.use.mock.calls[0][1];
		const onUnauthorized = jest.fn(async () => undefined);

		apiModule.setUnauthorizedHandler(onUnauthorized);
		apiModule.applyApiSession({ token: 'jwt-401', refreshToken: 'refresh-401' });
		axios.post.mockRejectedValueOnce({ response: { status: 401 } });

		await expect(responseErrorInterceptor({ response: { status: 401 } })).rejects.toEqual(
			expect.objectContaining({ response: { status: 401 } })
		);

		expect(onUnauthorized).toHaveBeenCalledTimes(1);
		expect(requestInterceptor({ headers: {} })).toMatchObject({ headers: {} });

		await expect(responseErrorInterceptor({ response: { status: 401 } })).rejects.toEqual(
			expect.objectContaining({ response: { status: 401 } })
		);
		expect(onUnauthorized).toHaveBeenCalledTimes(1);
	});

	it('refreshes token and retries the original request on 401', async () => {
		const apiModule = require('../services/api');
		const axios = require('axios');
		const { BASE_URL } = apiModule;
		const client = axios.create.mock.results[0].value;
		const requestInterceptor = client.interceptors.request.use.mock.calls[0][0];
		const responseErrorInterceptor = client.interceptors.response.use.mock.calls[0][1];
		const onUnauthorized = jest.fn(async () => undefined);
		const onSessionRefresh = jest.fn(async () => undefined);

		apiModule.setUnauthorizedHandler(onUnauthorized);
		apiModule.setSessionRefreshHandler(onSessionRefresh);
		apiModule.applyApiSession({ token: 'expired-jwt', refreshToken: 'valid-refresh' });

		axios.post.mockResolvedValueOnce({
			data: {
				item: {
					token: 'new-jwt',
					refreshToken: 'new-refresh',
				},
			},
		});
		client.request.mockResolvedValueOnce({ data: { ok: true } });

		await expect(
			responseErrorInterceptor({
				response: { status: 401 },
				config: { url: '/books', headers: {} },
			})
		).resolves.toEqual({ data: { ok: true } });

		expect(axios.post).toHaveBeenCalledWith(`${BASE_URL}/auth/refresh`, {
			refreshToken: 'valid-refresh',
		});
		expect(onSessionRefresh).toHaveBeenCalledTimes(1);
		expect(onSessionRefresh).toHaveBeenCalledWith({ token: 'new-jwt', refreshToken: 'new-refresh' });
		expect(client.request).toHaveBeenCalledWith(
			expect.objectContaining({
				__isRetryRequest: true,
				headers: expect.objectContaining({ Authorization: 'Bearer new-jwt' }),
			})
		);
		expect(onUnauthorized).not.toHaveBeenCalled();
		expect(requestInterceptor({ headers: {} })).toMatchObject({
			headers: { Authorization: 'Bearer new-jwt' },
		});
	});

	it('does not call the unauthorized handler for 401 responses without an active token', async () => {
		const apiModule = require('../services/api');
		const axios = require('axios');
		const client = axios.create.mock.results[0].value;
		const responseErrorInterceptor = client.interceptors.response.use.mock.calls[0][1];
		const onUnauthorized = jest.fn(async () => undefined);

		apiModule.clearApiSession();
		apiModule.setUnauthorizedHandler(onUnauthorized);

		await expect(responseErrorInterceptor({ response: { status: 401 } })).rejects.toEqual(
			expect.objectContaining({ response: { status: 401 } })
		);

		expect(onUnauthorized).not.toHaveBeenCalled();
	});
});