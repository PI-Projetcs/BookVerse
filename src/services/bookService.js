import axios from 'axios';
import { MOCK_BOOKS, MOCK_DISCUSSIONS_BY_BOOK } from '../mocks';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
const mockDiscussionsStore = JSON.parse(JSON.stringify(MOCK_DISCUSSIONS_BY_BOOK));

function normalizeBook(book = {}, index = 0) {
	return {
		id: Number(book.id ?? index + 1),
		title: book.title || 'Sem titulo',
		author: book.author || 'Autor nao informado',
		year: Number(book.year) || null,
		genre: book.genre || 'Geral',
		rating: Number(book.rating) || 0,
		coverUrl: book.coverUrl || book.cover_url || '',
		synopsis: book.synopsis || '',
		authorBio: book.authorBio || book.author_bio || '',
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
		const response = await axios.get(`${BASE_URL}/books`, {
			params: {
				q: query,
				sort: sortBy,
			},
		});

		if (Array.isArray(response.data)) {
			return normalizeList(response.data);
		}

		if (Array.isArray(response.data?.items)) {
			return normalizeList(response.data.items);
		}

		return [];
	} catch (error) {
		return getMockCatalogBooks({ query, sortBy });
	}
}

export async function getBookById(bookId) {
	if (USE_MOCK_DATA) {
		const normalizedId = Number(bookId);
		const selectedBook = normalizeList(MOCK_BOOKS).find((book) => book.id === normalizedId);
		return selectedBook || null;
	}

	try {
		const response = await axios.get(`${BASE_URL}/books/${bookId}`);

		if (response.data?.item) {
			return normalizeBook(response.data.item);
		}

		return normalizeBook(response.data);
	} catch (error) {
		const normalizedId = Number(bookId);
		const selectedBook = normalizeList(MOCK_BOOKS).find((book) => book.id === normalizedId);
		return selectedBook || null;
	}
}

export async function getDiscussions(bookId) {
	if (USE_MOCK_DATA) {
		return getMockDiscussions(bookId);
	}

	try {
		const response = await axios.get(`${BASE_URL}/books/${bookId}/discussions`);

		if (Array.isArray(response.data)) {
			return normalizeDiscussions(response.data);
		}

		if (Array.isArray(response.data?.chapters)) {
			return normalizeDiscussions(response.data.chapters);
		}

		return [];
	} catch (error) {
		return getMockDiscussions(bookId);
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
		const response = await axios.post(
			`${BASE_URL}/books/${bookId}/discussions/${chapterId}/comments`,
			commentData
		);

		return response.data;
	} catch (error) {
		const normalizedBookId = Number(bookId) || 1;
		const normalizedChapterId = Number(chapterId);
		const chapters = mockDiscussionsStore[normalizedBookId] || [];
		const chapterIndex = chapters.findIndex((chapter) => Number(chapter.id) === normalizedChapterId);

		if (chapterIndex < 0) {
			throw error;
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
		const response = await axios.post(
			`${BASE_URL}/books/${bookId}/discussions/${chapterId}/comments/${commentId}/like`
		);

		return response.data;
	} catch (error) {
		const normalizedBookId = Number(bookId) || 1;
		const normalizedChapterId = Number(chapterId);
		const normalizedCommentId = Number(commentId);
		const chapters = mockDiscussionsStore[normalizedBookId] || [];

		const chapter = chapters.find((item) => Number(item.id) === normalizedChapterId);
		if (!chapter) {
			throw error;
		}

		const comment = (chapter.comments || []).find((item) => Number(item.id) === normalizedCommentId);
		if (!comment) {
			throw error;
		}

		comment.likes = (Number(comment.likes) || 0) + 1;
		return { item: normalizeComment(comment) };
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
		const response = await axios.post(
			`${BASE_URL}/books/${bookId}/discussions/${chapterId}/comments/${commentId}/report`,
			{ reported: Boolean(reported) }
		);

		return response.data;
	} catch (error) {
		const normalizedBookId = Number(bookId) || 1;
		const normalizedChapterId = Number(chapterId);
		const normalizedCommentId = Number(commentId);
		const chapters = mockDiscussionsStore[normalizedBookId] || [];

		const chapter = chapters.find((item) => Number(item.id) === normalizedChapterId);
		if (!chapter) {
			throw error;
		}

		const comment = (chapter.comments || []).find((item) => Number(item.id) === normalizedCommentId);
		if (!comment) {
			throw error;
		}

		comment.reported = Boolean(reported);
		return { item: normalizeComment(comment) };
	}
}
