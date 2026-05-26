import api from './api';


function mapCatalogSortToBackend(sortBy = 'title') {
	if (sortBy === 'rating') {
		return 'mediaAvaliacao';
	}

	if (sortBy === 'genre') {
		return 'genero';
	}

	if (sortBy === 'author') {
		return 'autor';
	}

	if (sortBy === 'year') {
		return 'ano';
	}

	return 'titulo';
}

function toBackendBookPayload(bookData = {}) {
	return {
		titulo: bookData?.titulo || bookData?.title || '',
		autor: bookData?.autor || bookData?.author || '',
		genero: bookData?.genero || bookData?.genre || 'Geral',
		ano: bookData?.ano ?? bookData?.year ?? null,
		sinopse: bookData?.sinopse || bookData?.synopsis || '',
		coverUrl: bookData?.coverUrl || '',
		authorBio: bookData?.authorBio || bookData?.author_bio || bookData?.aboutAuthor || '',
		paginas: bookData?.paginas ?? bookData?.pages ?? null,
		ativo: Boolean(bookData?.ativo ?? bookData?.active ?? bookData?.available ?? true),
		destaque: Boolean(bookData?.destaque ?? bookData?.highlight ?? false),
		// Include chapters payload to allow backend to persist chapter list
		chapters: Array.isArray(bookData?.chapters)
			? bookData.chapters.map((ch, idx) => ({ id: ch?.id ?? idx + 1, title: ch?.title || ch }))
			: undefined,
		capitulos: Array.isArray(bookData?.chapters)
			? bookData.chapters.map((ch, idx) => ({ id: ch?.id ?? idx + 1, titulo: ch?.title || ch }))
			: undefined,
	};
}

function normalizeBook(book = {}, index = 0) {
	return {
		id: Number(book.id ?? index + 1),
		title: book.title || book.titulo || 'Sem titulo',
		author: book.author || book.autor || 'Autor nao informado',
		year: Number(book.year ?? book.ano) || null,
		genre: book.genre || book.genero || 'Geral',
		rating: Number(book.rating ?? book.mediaAvaliacao) || 0,
		coverUrl: book.coverUrl || book.cover_url || '',
		authorBio: book.authorBio || book.author_bio || '',
		synopsis: book.synopsis || book.sinopse || '',
		pages: Number(book.pages ?? book.paginas) || null,
		active: Boolean(book.active ?? book.ativo ?? true),
		highlight: Boolean(book.highlight ?? book.destaque ?? false),
		chapters: Array.isArray(book.chapters)
			? book.chapters.map((ch, idx) => ({ id: Number(ch.id ?? idx + 1), title: ch.title || ch.titulo || String(ch) }))
			: [],
	};
}

function normalizeList(items = []) {
	return items.map((item, index) => normalizeBook(item, index));
}

function filterAndSortBooks(items, { query = '', sortBy = 'title' } = {}) {
	const queryText = String(query || '')
		.trim()
		.toLowerCase();

	const filtered = items.filter((book) => {
		if (!queryText) {
			return true;
		}

		const searchableText = [book.title, book.author, book.genre, book.authorBio].join(' ').toLowerCase();
		return searchableText.includes(queryText);
	});

	return filtered.sort((left, right) => {
		if (sortBy === 'rating') {
			return (right.rating || 0) - (left.rating || 0);
		}

		if (sortBy === 'genre') {
			return String(left.genre || '').localeCompare(String(right.genre || ''), 'pt-BR');
		}

		if (sortBy === 'author') {
			return String(left.author || '').localeCompare(String(right.author || ''), 'pt-BR');
		}

		if (sortBy === 'year') {
			return (right.year || 0) - (left.year || 0);
		}

		return String(left.title || '').localeCompare(String(right.title || ''), 'pt-BR');
	});
}



function normalizeComment(comment = {}, index = 0) {
	return {
		id: Number(comment.id ?? Date.now() + index),
		author: comment.author || 'Leitor(a)',
		date: comment.date || 'Agora mesmo',
		text: comment.text || '',
		likes: Number(comment.likes) || 0,
		replies: Number(comment.replies) || 0,
		avatar: comment.avatar || 'https://i.pravatar.cc/100?img=5',
		reported: Boolean(comment.reported),
	};
}

function normalizeChapter(chapter = {}, index = 0) {
	const comments = Array.isArray(chapter.comments) ? chapter.comments : [];
	return {
		id: Number(chapter.id ?? index + 1),
		title: chapter.title || `Capitulo ${index + 1}`,
		comments: comments.map((comment, commentIndex) => normalizeComment(comment, commentIndex)),
	};
}

function normalizeDiscussions(items = []) {
	return items.map((item, index) => normalizeChapter(item, index));
}



function extractCollection(payload = {}) {
	if (Array.isArray(payload)) {
		return payload;
	}

	if (Array.isArray(payload?.content)) {
		return payload.content;
	}

	if (Array.isArray(payload?.items)) {
		return payload.items;
	}

	if (Array.isArray(payload?.data)) {
		return payload.data;
	}

	return [];
}

function formatCommentDate(value) {
	if (!value) {
		return 'Agora mesmo';
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return String(value);
	}

	return parsed.toLocaleDateString('pt-BR', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});
}

function normalizeBackendComment(comment = {}) {
	return {
		id: Number(comment.id ?? Date.now()),
		author: comment.usuarioNome || comment.author || 'Leitor(a)',
		date: formatCommentDate(comment.data || comment.date),
		text: comment.conteudo || comment.text || '',
		likes: Number(comment.likes) || 0,
		replies: Number(comment.replies) || 0,
		avatar: comment.avatar || 'https://i.pravatar.cc/100?img=5',
		reported: Boolean(comment.reported),
		status: (comment.status || '').toString().toUpperCase() || null,
		userId: Number(comment.usuarioId ?? comment.userId) || null,
		discussionId: Number(comment.discussaoId ?? comment.discussionId) || null,
	};
}

function normalizeBackendDiscussion(discussion = {}, comments = []) {
	return {
		id: Number(discussion.id),
		title: discussion.titulo || discussion.title || 'Discussão do capítulo',
		description: discussion.descricao || discussion.description || '',
		bookId: Number(discussion.livroId ?? discussion.bookId) || null,
		bookTitle: discussion.livroTitulo || discussion.bookTitle || '',
		comments: comments.map(normalizeBackendComment),
	};
}

async function fetchBackendComments(discussionId) {
	try {
		const response = await api.get(`/api/v1/comments/discussion/${discussionId}/approved`, {
			params: { size: 200, sort: 'id,desc' },
		});
		return extractCollection(response.data).map(normalizeBackendComment);
	} catch (error) {
		// Fallback para compatibilidade com ambientes onde o endpoint /approved não esteja disponível.
		const response = await api.get(`/api/v1/comments/discussion/${discussionId}`, {
			params: { size: 200, sort: 'id,desc' },
		});
		return extractCollection(response.data).map(normalizeBackendComment);
	}
}



export async function getCatalogBooks({ query = '', sortBy = 'title' } = {}) {
	try {
		const response = await api.get('/api/v1/books', {
			params: {
				q: query,
				sort: mapCatalogSortToBackend(sortBy),
			},
		});

		if (Array.isArray(response.data)) {
			return filterAndSortBooks(normalizeList(response.data).filter((book) => book.active !== false), { query, sortBy });
		}

		if (Array.isArray(response.data?.items)) {
			return filterAndSortBooks(normalizeList(response.data.items).filter((book) => book.active !== false), { query, sortBy });
		}

		if (Array.isArray(response.data?.content)) {
			return filterAndSortBooks(normalizeList(response.data.content).filter((book) => book.active !== false), { query, sortBy });
		}

		return [];
	} catch (error) {
		throw error;
	}
}

export async function getBookById(bookId) {
	try {
		const response = await api.get(`/api/v1/books/${bookId}`);

		if (response.data?.item) {
			return normalizeBook(response.data.item);
		}

		return normalizeBook(response.data);
	} catch (error) {
		throw error;
	}
}

export async function getAdminBooks() {
	try {
		const response = await api.get('/api/v1/books', {
			params: {
				includeInactive: true,
			},
		});

		if (Array.isArray(response.data)) {
			return normalizeList(response.data).sort((left, right) => right.id - left.id);
		}

		if (Array.isArray(response.data?.items)) {
			return normalizeList(response.data.items).sort((left, right) => right.id - left.id);
		}

		if (Array.isArray(response.data?.content)) {
			return normalizeList(response.data.content).sort((left, right) => right.id - left.id);
		}

		return [];
	} catch (error) {
		throw error;
	}
}

export async function createAdminBook(bookData) {
	const response = await api.post(`/api/v1/books`, toBackendBookPayload(bookData));
	if (response.data?.item) {
		return normalizeBook(response.data.item);
	}

	return normalizeBook(response.data);
}

export async function updateAdminBook(bookId, bookData) {
	const normalizedBookId = Number(bookId);

	try {
		const response = await api.put(`/api/v1/books/${bookId}`, toBackendBookPayload(bookData));

		if (response.data?.item) {
			return normalizeBook(response.data.item);
		}

		return normalizeBook(response.data);
	} catch (error) {
		throw error;
	}
}

export async function updateAdminBookStatus(bookId, ativo) {
	try {
		const response = await api.patch(`/api/v1/books/${bookId}/active`, { ativo: Boolean(ativo) });

		if (response.data?.item) {
			return normalizeBook(response.data.item);
		}

		return normalizeBook(response.data);
	} catch (error) {
		throw error;
	}
}

export async function deleteAdminBook(bookId) {
	const normalizedBookId = Number(bookId);

	try {
		await api.delete(`/api/v1/books/${bookId}`);
		return true;
	} catch (error) {
		throw error;
	}
}

export async function getDiscussions(bookId) {
	try {
		const response = await api.get(`/api/v1/discussions/book/${bookId}`);
		const discussions = extractCollection(response.data);
		const discussionsWithComments = await Promise.all(
			discussions.map(async (discussion) => {
				let comments = [];
				if (discussion?.id) {
					try {
						comments = await fetchBackendComments(discussion.id);
					} catch (commentError) {
						comments = [];
					}
				}
				return normalizeBackendDiscussion(discussion, comments);
			})
		);

		return discussionsWithComments;
	} catch (error) {
		throw error;
	}
}

export async function createDiscussionForChapter(bookId, chapterTitle, chapterDescription = '') {
	const fallbackTitle = chapterTitle ? `Discussão: ${chapterTitle}` : 'Discussão do capítulo';
	const fallbackDescription = chapterDescription || `Espaço para comentar sobre ${chapterTitle || 'o capítulo'}.`;
	const payload = {
		titulo: fallbackTitle,
		descricao: fallbackDescription,
		livroId: Number(bookId),
	};

	const response = await api.post('/api/v1/discussions', payload);
	const created = response.data?.item || response.data;
	return normalizeBackendDiscussion(created, []);
}

export async function getCommentsByDiscussion(discussionId) {
	const response = await api.get(`/api/v1/comments/discussion/${discussionId}`);
	return extractCollection(response.data).map(normalizeBackendComment);
}

export async function getApprovedCommentsByDiscussion(discussionId) {
    const response = await api.get(`/api/v1/comments/discussion/${discussionId}/approved`);
    return extractCollection(response.data).map(normalizeBackendComment);
}

export async function createCommentOnDiscussion(discussionId, commentData) {
	const payload = {
		conteudo: String(commentData?.conteudo || commentData?.text || '').trim(),
		discussaoId: Number(discussionId),
	};

	const response = await api.post('/api/v1/comments', payload);
	const created = response.data?.item || response.data;
	return { item: normalizeBackendComment(created) };
}

export async function addCommentToDiscussion(bookId, chapterId, commentData) {
	try {
		return createCommentOnDiscussion(chapterId, commentData);
	} catch (error) {
		throw error;
	}
}

export async function createChapterComment(chapterId, commentData) {
    const payload = {
        conteudo: String(commentData?.conteudo || '').trim(),
        discussaoId: Number(chapterId),
    };

    const response = await api.post('/api/v1/comments/chapter', payload);
    return normalizeBackendComment(response.data);
}

export async function likeComment(bookId, chapterId, commentId) {
	try {
		const response = await api.post(
			`/api/v1/books/${bookId}/discussions/${chapterId}/comments/${commentId}/like`
		);

		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function toggleReportComment(bookId, chapterId, commentId, reported) {
	try {
		const response = await api.post(
			`/api/v1/books/${bookId}/discussions/${chapterId}/comments/${commentId}/report`,
			{ reported: Boolean(reported) }
		);

		return response.data;
	} catch (error) {
		throw error;
	}
}

// Mock store for ratings
const mockRatingsStore = {};

function normalizeRating(rating = {}) {
	const rawStatus = String(rating?.status || '').toUpperCase();
	const status = ['PENDING', 'APPROVED', 'REJECTED'].includes(rawStatus) ? rawStatus : null;
	const author = rating?.usuarioNome || rating?.author || rating?.userName || rating?.username || 'Leitor(a)';
	const date = rating?.moderatedAt || rating?.createdAt || rating?.updatedAt || rating?.date || null;

	return {
		id: rating?.id || null,
		bookId: Number(rating?.bookId ?? rating?.book_id ?? rating?.livroId) || null,
		userId: Number(rating?.userId ?? rating?.user_id ?? rating?.usuarioId) || null,
		rating: Number(rating?.rating ?? rating?.avaliacao ?? rating?.nota) || 0,
		review: rating?.review || rating?.resenha || rating?.descricao || '',
		author,
		date,
		status,
		createdAt: rating?.createdAt || rating?.created_at || new Date().toISOString(),
		updatedAt: rating?.updatedAt || rating?.updated_at || new Date().toISOString(),
	};
}

export async function rateBook(bookId, ratingValue, review = '') {
	if (!bookId || !Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
		throw new Error('Avaliação inválida. Deve ser um inteiro entre 1 e 5.');
	}

	const payload = {
		avaliacao: ratingValue,
		resenha: String(review || ''),
	};

	try {
		const response = await api.post(`/api/v1/books/${bookId}/ratings`, payload);
		return { item: normalizeRating(response.data?.item || response.data) };
	} catch (error) {
		throw error;
	}
}

export async function getBookRatings(bookId) {
	try {
		const response = await api.get(`/api/v1/books/${bookId}/ratings`);
		const items = Array.isArray(response.data?.items)
			? response.data.items.map(normalizeRating)
			: [];
		return { items };
	} catch (error) {
		throw error;
	}
}

export async function updateBookRating(bookId, ratingValue, review = '') {
	if (!bookId || !Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
		throw new Error('Avaliação inválida. Deve ser um inteiro entre 1 e 5.');
	}

	const payload = {
		avaliacao: ratingValue,
		resenha: String(review || ''),
	};

	try {
		const response = await api.put(`/api/v1/books/${bookId}/ratings`, payload);
		return { item: normalizeRating(response.data?.item || response.data) };
	} catch (error) {
		throw error;
	}
}

export async function deleteBookRating(bookId) {
	try {
		const response = await api.delete(`/api/v1/books/${bookId}/ratings`);
		return response.data || { success: true };
	} catch (error) {
		throw error;
	}
}
