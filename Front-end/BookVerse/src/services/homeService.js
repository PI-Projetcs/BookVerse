import api from './api';
import {
	MOCK_BOOK_OF_MONTH,
	MOCK_CHAPTERS,
	MOCK_HIGHLIGHTS,
	MOCK_PROGRESS,
} from '../mocks';

const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

const mockHomeStore = {
	bookOfMonth: { ...MOCK_BOOK_OF_MONTH },
	progress: { ...MOCK_PROGRESS },
	chapters: MOCK_CHAPTERS.map((item) => ({ ...item })),
	highlights: MOCK_HIGHLIGHTS.map((item) => ({ ...item })),
};

function normalizeBookOfMonth(book = {}) {
	return {
		id: Number(book.id) || 1,
		monthLabel: book.monthLabel || 'Marco 2026',
		title: book.title || 'Livro do Mes',
		author: book.author || 'Autor(a)',
		description: book.description || 'Descricao nao informada.',
		members: Number(book.members) || 0,
		dateLabel: book.dateLabel || '',
		coverUrl: book.coverUrl || MOCK_BOOK_OF_MONTH.coverUrl,
	};
}

function normalizeProgress(progress = {}) {
	return {
		currentPage: Math.max(0, Number(progress.currentPage) || 0),
		totalPages: Math.max(0, Number(progress.totalPages) || 0),
		weeklyDone: Math.max(0, Number(progress.weeklyDone) || 0),
		weeklyGoal: Math.max(0, Number(progress.weeklyGoal) || 0),
	};
}

function normalizeChapter(chapter = {}, index = 0) {
	return {
		id: Number(chapter.id) || index + 1,
		title: chapter.title || `Capitulo ${index + 1}`,
		status: chapter.status || 'Bloqueado',
		state: chapter.state || 'locked',
	};
}

function normalizeHighlight(highlight = {}, index = 0) {
	return {
		id: highlight.id || `h${index + 1}`,
		text: highlight.text || '',
		author: highlight.author || 'Comunidade',
		likes: Math.max(0, Number(highlight.likes) || 0),
		liked: Boolean(highlight.liked),
	};
}

function normalizeHomeData(data = {}) {
	const source = data?.item || data;
	return {
		bookOfMonth: normalizeBookOfMonth(source.bookOfMonth),
		progress: normalizeProgress(source.progress),
		chapters: Array.isArray(source.chapters)
			? source.chapters.map((chapter, index) => normalizeChapter(chapter, index))
			: [],
		highlights: Array.isArray(source.highlights)
			? source.highlights.map((highlight, index) => normalizeHighlight(highlight, index))
			: [],
	};
}

function getMockHomeData() {
	return normalizeHomeData(mockHomeStore);
}

function updateMockHighlightLike(highlightId, liked) {
	const highlightIndex = mockHomeStore.highlights.findIndex((item) => item.id === highlightId);
	if (highlightIndex < 0) {
		return null;
	}

	const previous = mockHomeStore.highlights[highlightIndex];
	const nextLiked = Boolean(liked);
	const likeDelta = nextLiked === previous.liked ? 0 : nextLiked ? 1 : -1;

	mockHomeStore.highlights[highlightIndex] = {
		...previous,
		liked: nextLiked,
		likes: Math.max(0, (Number(previous.likes) || 0) + likeDelta),
	};

	return normalizeHighlight(mockHomeStore.highlights[highlightIndex], highlightIndex);
}

function toBookOfMonthPayload(bookData = {}) {
	const now = new Date();
	const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
	const dateLabel = now.toLocaleDateString('pt-BR');

	return normalizeBookOfMonth({
		id: Number(bookData.id) || 1,
		monthLabel,
		title: bookData.title,
		author: bookData.author,
		description: bookData.synopsis || bookData.description,
		members: Number(bookData.members) || mockHomeStore.bookOfMonth.members || 0,
		dateLabel,
		coverUrl: bookData.coverUrl,
	});
}

export async function getHomeViewModel() {
	if (USE_MOCK_DATA) {
		return getMockHomeData();
	}

	try {
		const response = await api.get('/api/v1/home');
		return normalizeHomeData(response.data);
	} catch (error) {
		throw error;
	}
}

export async function updateHomeProgress(progressData) {
	const normalizedProgress = normalizeProgress(progressData);

	if (USE_MOCK_DATA) {
		mockHomeStore.progress = { ...mockHomeStore.progress, ...normalizedProgress };
		return normalizeProgress(mockHomeStore.progress);
	}

	try {
		const response = await api.put(`/api/v1/home/progress`, normalizedProgress);
		const result = response.data?.item || response.data;
		return normalizeProgress(result || normalizedProgress);
	} catch (error) {
		throw error;
	}
}

export async function toggleHomeHighlightLike(highlightId, liked) {
	if (USE_MOCK_DATA) {
		return updateMockHighlightLike(highlightId, liked);
	}

	try {
		const response = await api.post(`/api/v1/home/highlights/${highlightId}/like`, {
			liked: Boolean(liked),
		});

		const result = response.data?.item || response.data;
		if (!result) {
			return null;
		}

		return normalizeHighlight(result);
	} catch (error) {
		throw error;
	}
}

export async function updateBookOfMonth(bookData) {
	const payload = toBookOfMonthPayload(bookData);

	if (USE_MOCK_DATA) {
		mockHomeStore.bookOfMonth = { ...payload };
		return normalizeBookOfMonth(mockHomeStore.bookOfMonth);
	}

	try {
		const response = await api.post(`/api/v1/books/${bookData.id}/set-book-of-month`);
		const result = response.data?.item || response.data;
		const normalized = normalizeBookOfMonth(result || payload);
		mockHomeStore.bookOfMonth = { ...normalized };
		return normalized;
	} catch (error) {
		throw error;
	}
}
