describe('bookService customer flows (mock mode)', () => {
	beforeEach(() => {
		jest.resetModules();
		process.env.EXPO_PUBLIC_USE_MOCK = 'true';
	});

	it('searches, sorts, and loads book catalog and details', async () => {
		const { getCatalogBooks, getBookById } = require('../services/bookService');

		const catalog = await getCatalogBooks({ query: 'orwell', sortBy: 'rating' });
		expect(catalog).toHaveLength(1);
		expect(catalog[0]).toMatchObject({ title: '1984', author: 'George Orwell' });

		const sorted = await getCatalogBooks({ query: '', sortBy: 'rating' });
		for (let index = 1; index < sorted.length; index += 1) {
			expect(sorted[index - 1].rating).toBeGreaterThanOrEqual(sorted[index].rating);
		}

		const details = await getBookById(2);
		expect(details).toMatchObject({ title: 'O Hobbit', author: 'J. R. R. Tolkien' });
	});

	it('loads discussions and mutates comments in mock mode', async () => {
		const {
			getDiscussions,
			addCommentToDiscussion,
			likeComment,
			toggleReportComment,
		} = require('../services/bookService');

		const discussions = await getDiscussions(1);
		expect(discussions.length).toBeGreaterThan(0);
		expect(Array.isArray(discussions[0].comments)).toBe(true);

		const added = await addCommentToDiscussion(1, discussions[0].id, {
			text: 'Comentário de teste',
			author: 'Você',
		});
		expect(added?.item).toMatchObject({ text: 'Comentário de teste', author: 'Você' });

		const liked = await likeComment(1, discussions[0].id, discussions[0].comments[0].id);
		expect(liked?.item?.likes).toBeGreaterThanOrEqual(1);

		const reported = await toggleReportComment(1, discussions[0].id, discussions[0].comments[0].id, true);
		expect(reported?.item?.reported).toBe(true);
	});
});