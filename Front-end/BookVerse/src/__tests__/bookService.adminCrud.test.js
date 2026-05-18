jest.mock('axios', () => {
	const state = {
		books: [],
		nextId: 1,
	};

	const client = {
		get: jest.fn(async (url) => {
			if (url === '/api/v1/books') {
				return { data: state.books.map((book) => ({ ...book })) };
			}

			return { data: null };
		}),
		post: jest.fn(async (url, payload) => {
			if (url === '/api/v1/books') {
				const created = { id: state.nextId += 1, ...payload, id: state.nextId - 1 };
				state.books.push(created);
				return { data: created };
			}

			return { data: null };
		}),
		put: jest.fn(async (url, payload) => {
			const match = String(url).match(/\/api\/v1\/books\/(\d+)/);
			if (!match) {
				return { data: null };
			}

			const bookId = Number(match[1]);
			const index = state.books.findIndex((book) => book.id === bookId);
			if (index === -1) {
				return { data: null };
			}

			state.books[index] = { ...state.books[index], ...payload, id: bookId };
			return { data: state.books[index] };
		}),
		delete: jest.fn(async (url) => {
			const match = String(url).match(/\/api\/v1\/books\/(\d+)/);
			if (!match) {
				return { data: null };
			}

			const bookId = Number(match[1]);
			state.books = state.books.filter((book) => book.id !== bookId);
			return { data: { success: true } };
		}),
		interceptors: {
			request: { use: jest.fn() },
			response: { use: jest.fn() },
		},
	};

	return {
		__esModule: true,
		default: {
			create: jest.fn(() => client),
			post: jest.fn(),
		},
		create: jest.fn(() => client),
		post: jest.fn(),
	};
});

describe('bookService admin CRUD (mock mode)', () => {
	beforeEach(() => {
		jest.resetModules();
		const axios = require('axios');
		const client = axios.create();
		client.get.mockClear();
		client.post.mockClear();
		client.put.mockClear();
		client.delete.mockClear();
	});

	it('creates, updates, and deletes an admin book', async () => {
		const {
			getAdminBooks,
			createAdminBook,
			updateAdminBook,
			deleteAdminBook,
		} = require('../services/bookService');

		const before = await getAdminBooks();
		const created = await createAdminBook({
			title: 'Livro Teste QA',
			author: 'Equipe QA',
			authorBio: 'Equipe responsável pela curadoria do catálogo BookVerse.',
			genre: 'Fantasia',
			year: 2026,
			rating: 4.8,
		});

		expect(created).toBeTruthy();
		expect(created.id).toBeDefined();
		expect(created.authorBio).toBe('Equipe responsável pela curadoria do catálogo BookVerse.');

		const afterCreate = await getAdminBooks();
		expect(afterCreate.length).toBe(before.length + 1);
		expect(afterCreate.some((item) => item.id === created.id)).toBe(true);

		const updated = await updateAdminBook(created.id, { title: 'Livro Teste QA Atualizado' });
		expect(updated?.title).toBe('Livro Teste QA Atualizado');

		const deleted = await deleteAdminBook(created.id);
		expect(deleted).toBe(true);

		const afterDelete = await getAdminBooks();
		expect(afterDelete.length).toBe(before.length);
		expect(afterDelete.some((item) => item.id === created.id)).toBe(false);
	});
});