import axios from 'axios';
import {
	MOCK_BOOK_OF_MONTH,
	MOCK_CHAPTERS,
	MOCK_HIGHLIGHTS,
	MOCK_PROGRESS,
} from '../mocks';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
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

export async function getHomeViewModel() {
	if (USE_MOCK_DATA) {
		return getMockHomeData();
	}

	try {
		const response = await axios.get(`${BASE_URL}/home`);
		return normalizeHomeData(response.data);
	} catch (error) {
		return getMockHomeData();
	}
}

export async function updateHomeProgress(progressData) {
	const normalizedProgress = normalizeProgress(progressData);

	if (USE_MOCK_DATA) {
		mockHomeStore.progress = { ...mockHomeStore.progress, ...normalizedProgress };
		return normalizeProgress(mockHomeStore.progress);
	}

	try {
		const response = await axios.put(`${BASE_URL}/home/progress`, normalizedProgress);
		const result = response.data?.item || response.data;
		return normalizeProgress(result || normalizedProgress);
	} catch (error) {
		mockHomeStore.progress = { ...mockHomeStore.progress, ...normalizedProgress };
		return normalizeProgress(mockHomeStore.progress);
	}
}

export async function toggleHomeHighlightLike(highlightId, liked) {
	if (USE_MOCK_DATA) {
		return updateMockHighlightLike(highlightId, liked);
	}

	try {
		const response = await axios.post(`${BASE_URL}/home/highlights/${highlightId}/like`, {
			liked: Boolean(liked),
		});

		const result = response.data?.item || response.data;
		if (!result) {
			return null;
		}

		return normalizeHighlight(result);
	} catch (error) {
		return updateMockHighlightLike(highlightId, liked);
	}
}
