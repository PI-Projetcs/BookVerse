describe('bookService admin CRUD (mock mode)', () => {
	beforeEach(() => {
		jest.resetModules();
		process.env.EXPO_PUBLIC_USE_MOCK = 'true';
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
			genre: 'Fantasia',
			year: 2026,
			rating: 4.8,
		});

		expect(created).toBeTruthy();
		expect(created.id).toBeDefined();

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