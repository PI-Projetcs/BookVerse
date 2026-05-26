import {
	formatRatingDate,
	getRatingAuthor,
	getRatingStatusLabel,
	pickFeaturedRatings,
	renderRatingDistribution,
} from '../utils/ratingUtils';

describe('ratingUtils', () => {
	it('calculates rating summary from approved ratings only', () => {
		const summary = renderRatingDistribution([
			{ rating: 5, status: 'APPROVED' },
			{ rating: 4, status: 'APPROVED' },
			{ rating: 2, status: 'PENDING' },
			{ rating: 3 },
		]);

		expect(summary.total).toBe(3);
		expect(summary.average).toBeCloseTo(4.0, 1);
		expect(summary.highlyRated).toBe(2);
		expect(summary.distribution).toEqual({ 5: 1, 4: 1, 3: 1, 2: 0, 1: 0 });
	});

	it('prioritizes featured ratings with text, higher score and recency', () => {
		const featured = pickFeaturedRatings([
			{ id: 1, rating: 4, review: '', status: 'APPROVED', createdAt: '2026-01-01T10:00:00Z' },
			{ id: 2, rating: 5, review: 'Muito bom', status: 'APPROVED', createdAt: '2026-01-02T10:00:00Z' },
			{ id: 3, rating: 5, review: 'Excelente', status: 'APPROVED', createdAt: '2026-01-03T10:00:00Z' },
			{ id: 4, rating: 5, review: 'Pendente', status: 'PENDING', createdAt: '2026-01-04T10:00:00Z' },
		]);

		expect(featured.map((item) => item.id)).toEqual([3, 2, 1]);
	});

	it('returns readable labels for author, status and invalid dates', () => {
		expect(getRatingAuthor({ userId: 4, author: 'Ana' }, 4)).toBe('Você');
		expect(getRatingAuthor({ usuarioNome: 'Bruno' }, 99)).toBe('Bruno');
		expect(getRatingStatusLabel('PENDING')).toBe('Em moderação');
		expect(getRatingStatusLabel('REJECTED')).toBe('Rejeitada');
		expect(getRatingStatusLabel('APPROVED')).toBe('Publicada');
		expect(formatRatingDate()).toBe('Data não informada');
		expect(formatRatingDate('invalid-date')).toBe('Data não informada');
	});
});