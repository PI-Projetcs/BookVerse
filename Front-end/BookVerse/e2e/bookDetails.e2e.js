describe('Book details rating flow', () => {
	beforeAll(async () => {
		await device.launchApp({ newInstance: true });
	});

	it('opens a book, writes a rating, saves it and sees the flow complete', async () => {
		await element(by.id('catalog-book-item-10')).tap();
		await waitFor(element(by.id('book-details-screen')))
			.toBeVisible()
			.withTimeout(10000);

		await element(by.id('rating-star-5')).tap();
		await element(by.id('rating-review-input')).replaceText('Leitura excelente e envolvente');
		await element(by.id('rating-submit-button')).tap();

		await waitFor(element(by.text('Atualize sua avaliação')))
			.toBeVisible()
			.withTimeout(10000);
	});
});
