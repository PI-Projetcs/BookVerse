describe('homeService workflows (mock mode)', () => {
	beforeEach(() => {
		jest.resetModules();
		process.env.EXPO_PUBLIC_USE_MOCK = 'true';
	});

	it('loads the home view model and updates progress, highlights, and book of month', async () => {
		const {
			getHomeViewModel,
			updateHomeProgress,
			toggleHomeHighlightLike,
			updateBookOfMonth,
		} = require('../services/homeService');

		const home = await getHomeViewModel();
		expect(home.bookOfMonth.title).toBeTruthy();
		expect(home.progress.totalPages).toBeGreaterThan(0);
		expect(home.chapters.length).toBeGreaterThan(0);
		expect(home.highlights.length).toBeGreaterThan(0);

		const progress = await updateHomeProgress({ currentPage: 300, totalPages: 500, weeklyDone: 20, weeklyGoal: 50 });
		expect(progress).toMatchObject({ currentPage: 300, totalPages: 500, weeklyDone: 20, weeklyGoal: 50 });

		const firstHighlight = home.highlights[0];
		const liked = await toggleHomeHighlightLike(firstHighlight.id, true);
		expect(liked).toMatchObject({ id: firstHighlight.id, liked: true });

		const updatedBook = await updateBookOfMonth({
			id: 99,
			title: 'Livro do Mês QA',
			author: 'Equipe QA',
			synopsis: 'Sinopse de teste',
			members: 42,
			coverUrl: 'https://example.com/capa.jpg',
		});

		expect(updatedBook).toMatchObject({
			id: 99,
			title: 'Livro do Mês QA',
			author: 'Equipe QA',
		});
		expect(updatedBook.monthLabel).toBeTruthy();
		expect(updatedBook.dateLabel).toBeTruthy();
	});
});