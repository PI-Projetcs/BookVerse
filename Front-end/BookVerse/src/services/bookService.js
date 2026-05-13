import api from './api';
import { MOCK_ADMIN_BOOKS, MOCK_BOOKS, MOCK_DISCUSSIONS_BY_BOOK } from '../mocks';

const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
const mockDiscussionsStore = JSON.parse(JSON.stringify(MOCK_DISCUSSIONS_BY_BOOK));
const mockAdminBooksStore = normalizeList(JSON.parse(JSON.stringify(MOCK_ADMIN_BOOKS)));

function mapCatalogSortToBackend(sortBy = 'title') {
	if (sortBy === 'rating') {
		return 'mediaAvaliacao';
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
		mediaAvaliacao: bookData?.mediaAvaliacao ?? bookData?.rating ?? 0,
		paginas: bookData?.paginas ?? bookData?.pages ?? null,
		destaque: Boolean(bookData?.destaque ?? bookData?.highlight ?? false),
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
		synopsis: book.synopsis || book.sinopse || '',
		authorBio: book.authorBio || book.author_bio || '',
		pages: Number(book.pages ?? book.paginas) || null,
		highlight: Boolean(book.highlight ?? book.destaque ?? false),
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

		const searchableText = [book.title, book.author, book.genre].join(' ').toLowerCase();
		return searchableText.includes(queryText);
	});

	return filtered.sort((left, right) => {
		if (sortBy === 'rating') {
			return (right.rating || 0) - (left.rating || 0);
		}

		if (sortBy === 'year') {
			return (right.year || 0) - (left.year || 0);
		}

		return String(left.title || '').localeCompare(String(right.title || ''), 'pt-BR');
	});
}

function getMockCatalogBooks(params) {
	return filterAndSortBooks(normalizeList(MOCK_BOOKS), params);
}

function getMockAdminBooks() {
	return normalizeList(mockAdminBooksStore).sort((left, right) => right.id - left.id);
}

function getNextMockBookId(items = []) {
	return items.reduce((currentMax, item) => Math.max(currentMax, Number(item.id) || 0), 0) + 1;
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

function getMockDiscussions(bookId) {
	const normalizedBookId = Number(bookId) || 1;
	const chapters = mockDiscussionsStore[normalizedBookId] || [];
	return normalizeDiscussions(chapters);
}

function getNextMockCommentId(chapters = []) {
	let currentMax = 0;
	chapters.forEach((chapter) => {
		(chapter.comments || []).forEach((comment) => {
			currentMax = Math.max(currentMax, Number(comment.id) || 0);
		});
	});
	return currentMax + 1;
}

export async function getCatalogBooks({ query = '', sortBy = 'title' } = {}) {
	if (USE_MOCK_DATA) {
		return getMockCatalogBooks({ query, sortBy });
	}

	try {
		const response = await api.get('/api/v1/books', {
			params: {
				q: query,
				sort: mapCatalogSortToBackend(sortBy),
			},
		});

		if (Array.isArray(response.data)) {
			return normalizeList(response.data);
		}

		if (Array.isArray(response.data?.items)) {
			return normalizeList(response.data.items);
		}

		if (Array.isArray(response.data?.content)) {
			return normalizeList(response.data.content);
		}

		return [];
	} catch (error) {
		throw error;
	}
}

export async function getBookById(bookId) {
	if (USE_MOCK_DATA) {
		const normalizedId = Number(bookId);
		const selectedBook = normalizeList(MOCK_BOOKS).find((book) => book.id === normalizedId);
		return selectedBook || null;
	}

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
	if (USE_MOCK_DATA) {
		return getMockAdminBooks();
	}

	try {
		const response = await api.get('/api/v1/books');

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
	if (USE_MOCK_DATA) {
		const newBook = normalizeBook({
			...bookData,
			id: getNextMockBookId(mockAdminBooksStore),
		});

		mockAdminBooksStore.unshift(newBook);
		return newBook;
	}

	const response = await api.post(`/api/v1/books`, toBackendBookPayload(bookData));
	if (response.data?.item) {
		return normalizeBook(response.data.item);
	}

	return normalizeBook(response.data);
}

export async function updateAdminBook(bookId, bookData) {
	const normalizedBookId = Number(bookId);

	if (USE_MOCK_DATA) {
		const bookIndex = mockAdminBooksStore.findIndex((item) => Number(item.id) === normalizedBookId);
		if (bookIndex < 0) {
			return null;
		}

		const updatedBook = normalizeBook({
			...mockAdminBooksStore[bookIndex],
			...bookData,
			id: normalizedBookId,
		});

		mockAdminBooksStore[bookIndex] = updatedBook;
		return updatedBook;
	}

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

export async function deleteAdminBook(bookId) {
	const normalizedBookId = Number(bookId);

	if (USE_MOCK_DATA) {
		const bookIndex = mockAdminBooksStore.findIndex((item) => Number(item.id) === normalizedBookId);
		if (bookIndex < 0) {
			return false;
		}

		mockAdminBooksStore.splice(bookIndex, 1);
		return true;
	}

	try {
		await api.delete(`/api/v1/books/${bookId}`);
		return true;
	} catch (error) {
		throw error;
	}
}

export async function getDiscussions(bookId) {
	if (USE_MOCK_DATA) {
		return getMockDiscussions(bookId);
	}

	try {
		const response = await api.get(`/api/v1/discussions/book/${bookId}`);

		if (Array.isArray(response.data)) {
			return normalizeDiscussions(response.data);
		}

		if (Array.isArray(response.data?.chapters)) {
			return normalizeDiscussions(response.data.chapters);
		}

		if (Array.isArray(response.data?.content)) {
			return normalizeDiscussions(response.data.content);
		}

		return [];
	} catch (error) {
		throw error;
	}
}

export async function addCommentToDiscussion(bookId, chapterId, commentData) {
	if (USE_MOCK_DATA) {
		const normalizedBookId = Number(bookId) || 1;
		const normalizedChapterId = Number(chapterId);
		const chapters = mockDiscussionsStore[normalizedBookId] || [];
		const chapterIndex = chapters.findIndex((chapter) => Number(chapter.id) === normalizedChapterId);

		if (chapterIndex < 0) {
			return null;
		}

		const nextId = getNextMockCommentId(chapters);
		const newComment = normalizeComment({
			id: nextId,
			author: commentData?.author || 'Voce',
			date: commentData?.date || 'Agora mesmo',
			text: commentData?.text || '',
			likes: 0,
			replies: 0,
			avatar: commentData?.avatar,
			reported: false,
		});

		chapters[chapterIndex].comments = [newComment, ...(chapters[chapterIndex].comments || [])];
		mockDiscussionsStore[normalizedBookId] = chapters;

		return { item: newComment };
	}

	try {
		const response = await api.post(
			`/api/v1/books/${bookId}/discussions/${chapterId}/comments`,
			commentData
		);

		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function likeComment(bookId, chapterId, commentId) {
	if (USE_MOCK_DATA) {
		const normalizedBookId = Number(bookId) || 1;
		const normalizedChapterId = Number(chapterId);
		const normalizedCommentId = Number(commentId);
		const chapters = mockDiscussionsStore[normalizedBookId] || [];

		const chapter = chapters.find((item) => Number(item.id) === normalizedChapterId);
		if (!chapter) {
			return null;
		}

		const comment = (chapter.comments || []).find((item) => Number(item.id) === normalizedCommentId);
		if (!comment) {
			return null;
		}

		comment.likes = (Number(comment.likes) || 0) + 1;
		return { item: normalizeComment(comment) };
	}

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
	if (USE_MOCK_DATA) {
		const normalizedBookId = Number(bookId) || 1;
		const normalizedChapterId = Number(chapterId);
		const normalizedCommentId = Number(commentId);
		const chapters = mockDiscussionsStore[normalizedBookId] || [];

		const chapter = chapters.find((item) => Number(item.id) === normalizedChapterId);
		if (!chapter) {
			return null;
		}

		const comment = (chapter.comments || []).find((item) => Number(item.id) === normalizedCommentId);
		if (!comment) {
			return null;
		}

		comment.reported = Boolean(reported);
		return { item: normalizeComment(comment) };
	}

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
	return {
		id: rating?.id || null,
		bookId: Number(rating?.bookId ?? rating?.book_id) || null,
		userId: Number(rating?.userId ?? rating?.user_id) || null,
		rating: Number(rating?.rating ?? rating?.avaliacao) || 0,
		review: rating?.review || rating?.resenha || '',
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

	if (USE_MOCK_DATA) {
		const bookIdKey = `book_${bookId}`;
		const rating = normalizeRating({
			id: Math.random(),
			bookId,
			rating: ratingValue,
			review,
			createdAt: new Date().toISOString(),
		});
		mockRatingsStore[bookIdKey] = rating;
		return { item: rating };
	}

	try {
		const response = await api.post(`/api/v1/books/${bookId}/ratings`, payload);
		return { item: normalizeRating(response.data?.item || response.data) };
	} catch (error) {
		throw error;
	}
}

export async function getBookRatings(bookId) {
	if (USE_MOCK_DATA) {
		const bookIdKey = `book_${bookId}`;
		const rating = mockRatingsStore[bookIdKey];
		return {
			items: rating ? [rating] : [],
		};
	}

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

	if (USE_MOCK_DATA) {
		const bookIdKey = `book_${bookId}`;
		const rating = normalizeRating({
			id: mockRatingsStore[bookIdKey]?.id || Math.random(),
			bookId,
			rating: ratingValue,
			review,
			updatedAt: new Date().toISOString(),
		});
		mockRatingsStore[bookIdKey] = rating;
		return { item: rating };
	}

	try {
		const response = await api.put(`/api/v1/books/${bookId}/ratings`, payload);
		return { item: normalizeRating(response.data?.item || response.data) };
	} catch (error) {
		throw error;
	}
}

export async function deleteBookRating(bookId) {
	if (USE_MOCK_DATA) {
		const bookIdKey = `book_${bookId}`;
		delete mockRatingsStore[bookIdKey];
		return { success: true };
	}

	try {
		const response = await api.delete(`/api/v1/books/${bookId}/ratings`);
		return response.data || { success: true };
	} catch (error) {
		throw error;
	}
}
