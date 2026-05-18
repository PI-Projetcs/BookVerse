const {
	MOCK_BOOKS,
	MOCK_BOOK_OF_MONTH,
	MOCK_PROGRESS,
	MOCK_CHAPTERS,
	MOCK_HIGHLIGHTS,
	MOCK_DISCUSSIONS_BY_BOOK,
} = require('../mocks');

// In-memory stores for mutable resources used in tests
const ratingsStore = {};

function ok(data) {
	return Promise.resolve({ data });
}

function parseBookId(url) {
	const m = url.match(/\/api\/v1\/books\/(\d+)/);
	return m ? Number(m[1]) : null;
}

module.exports = {
	get: jest.fn((url, config) => {
		if (typeof url !== 'string') return ok({});

		if (url.startsWith('/api/v1/home')) {
			return ok({
				bookOfMonth: MOCK_BOOK_OF_MONTH,
				progress: MOCK_PROGRESS,
				chapters: MOCK_CHAPTERS,
				highlights: MOCK_HIGHLIGHTS,
			});
		}

		if (url === '/api/v1/books' || url.startsWith('/api/v1/books?')) {
			return ok(MOCK_BOOKS);
		}

		const bookId = parseBookId(url);
		if (bookId) {
			if (url.endsWith('/ratings')) {
				const items = ratingsStore[bookId] || [];
				return ok({ items });
			}

			if (url.includes('/discussions') || url.includes('/discuss')) {
				return ok(MOCK_DISCUSSIONS_BY_BOOK[bookId] || []);
			}

			// get book by id
			const book = (MOCK_BOOKS || []).find((b) => Number(b.id) === Number(bookId));
			return ok({ item: book || null });
		}

		return ok({});
	}),

	post: jest.fn((url, payload) => {
		if (url.startsWith('/api/v1/books/') && /\/ratings$/.test(url)) {
			const bookId = parseBookId(url);
			if (!bookId) return ok({});
			const rating = {
				id: Date.now(),
				bookId,
				rating: Number(payload?.avaliacao ?? payload?.rating) || Number(payload?.rating) || 0,
				review: String(payload?.resenha ?? payload?.review || ''),
				createdAt: new Date().toISOString(),
			};
			ratingsStore[bookId] = ratingsStore[bookId] || [];
			ratingsStore[bookId].push(rating);
			return ok({ item: rating });
		}

		if (url.startsWith('/api/v1/home/highlights/') && url.endsWith('/like')) {
			const idMatch = url.match(/highlights\/(.+)\/like$/);
			const id = idMatch ? idMatch[1] : null;
			const found = (MOCK_HIGHLIGHTS || []).find((h) => String(h.id) === String(id));
			if (!found) return ok({});
			const liked = Boolean(payload?.liked);
			found.liked = liked;
			if (liked) found.likes = (found.likes || 0) + 1;
			else found.likes = Math.max(0, (found.likes || 0) - 1);
			return ok({ item: found });
		}

		if (url.match(/\/api\/v1\/books\/\d+\/discussions\/\d+\/comments\/\d+\/like/)) {
			const m = url.match(/books\/(\d+)\/discussions\/(\d+)\/comments\/(\d+)\/like/);
			if (!m) return ok({});
			const bookId = Number(m[1]);
			const discussionId = Number(m[2]);
			const commentId = Number(m[3]);
			const discussions = MOCK_DISCUSSIONS_BY_BOOK[bookId] || [];
			let foundComment = null;
			for (const disc of discussions) {
				if (Number(disc.id) === discussionId) {
					for (const c of disc.comments || []) {
						if (Number(c.id) === commentId) {
							foundComment = c;
							break;
						}
					}
					if (foundComment) break;
				}
			}
			if (!foundComment) return ok({});
			const liked = payload && typeof payload.liked !== 'undefined' ? Boolean(payload.liked) : true;
			foundComment.likes = liked ? (foundComment.likes || 0) + 1 : Math.max(0, (foundComment.likes || 0) - 1);
			return ok({ item: foundComment });
		}

		return ok({});
	}),

	put: jest.fn((url, payload) => {
		if (url.startsWith('/api/v1/books/') && /\/chapters\//.test(url) && /\/status$/.test(url)) {
			const bookId = parseBookId(url);
			const m = url.match(/chapters\/(\d+)\/status$/);
			const chapterId = m ? Number(m[1]) : null;
			if (!chapterId) return ok({});
			const status = String(payload?.status || payload || '');
			const state = status === 'Concluído' ? 'done' : status ? 'active' : 'active';
			return ok({ id: chapterId, status, state });
		}

		if (url === '/api/v1/home/progress') {
			return ok({ item: payload });
		}

		if (url.startsWith('/api/v1/books/') && /\/ratings$/.test(url)) {
			const bookId = parseBookId(url);
			if (!bookId) return ok({});
			const list = ratingsStore[bookId] || [];
			if (list.length === 0) return ok({ item: null });
			// naive: update first rating
			const r = list[0];
			r.rating = Number(payload?.avaliacao ?? payload?.rating) || r.rating;
			r.review = String(payload?.resenha ?? payload?.review || r.review || '');
			r.updatedAt = new Date().toISOString();
			return ok({ item: r });
		}

		return ok({});
	}),

	delete: jest.fn((url) => {
		if (url.startsWith('/api/v1/books/') && /\/ratings$/.test(url)) {
			const bookId = parseBookId(url);
			if (!bookId) return ok({ success: true });
			delete ratingsStore[bookId];
			return ok({ success: true });
		}

		return ok({});
	}),

	__resetMocks: () => {
		Object.keys(ratingsStore).forEach((k) => delete ratingsStore[k]);
	},
};
