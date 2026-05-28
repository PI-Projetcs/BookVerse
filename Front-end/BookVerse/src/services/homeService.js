import api from './api';
import { getDiscussions } from './bookService';

let chapterStatusEndpointSupported = undefined; // undefined = desconhecido, false = não suportado, true = suportado

function normalizeBookOfMonth(book = {}) {
	return {
		id: Number(book.id) || 1,
		monthLabel: book.monthLabel || book.mesLabel || 'Marco 2026',
		title: book.title || book.titulo || 'Livro do Mes',
		author: book.author || book.autor || 'Autor(a)',
		description: book.description || book.synopsis || book.sinopse || 'Descricao nao informada.',
		synopsis: book.synopsis || book.sinopse || book.description || 'Descricao nao informada.',
		pages: Number(book.pages ?? book.paginas) || 0,
		members: Number(book.members) || 0,
		dateLabel: book.dateLabel || '',
		coverUrl: book.coverUrl || 'https://placehold.co/240x320/f3f4f6/111827?text=Capa',
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
	const normalizedStatus = String(chapter.status || '').trim();
	const rawState = String(chapter.state || '').trim().toLowerCase();

	const resolvedState =
		rawState === 'locked'
			? 'locked'
			: normalizedStatus === 'Concluído'
				? 'done'
				: normalizedStatus === 'Em leitura'
					? 'active'
					: 'idle';

	return {
		id: Number(chapter.id) || index + 1,
		title: chapter.title || `Capitulo ${index + 1}`,
		status: normalizedStatus,
		state: resolvedState,
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


function countUniqueCommenters(discussions = []) {
	const uniqueCommenters = new Set();

	discussions.forEach((discussion) => {
		(discussion?.comments || []).forEach((comment) => {
			const key = String(comment?.author || comment?.usuarioNome || '').trim().toLowerCase();
			if (key) {
				uniqueCommenters.add(key);
			}
		});
	});

	return uniqueCommenters.size;
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
		members: Number(bookData.members) || 0,
		dateLabel,
		coverUrl: bookData.coverUrl,
	});
}

export async function getHomeViewModel() {
	try {
		const response = await api.get('/api/v1/home');
		const homeData = normalizeHomeData(response.data);

		if (homeData?.bookOfMonth?.id) {
			try {
				const discussions = await getDiscussions(homeData.bookOfMonth.id);
				homeData.bookOfMonth.members = countUniqueCommenters(discussions);
			} catch (discussionError) {
				// Mantém o cartão inicial utilizável mesmo se a busca de comentários falhar.
				homeData.bookOfMonth.members = Number(homeData.bookOfMonth.members) || 0;
			}
		}

		if (!homeData.progress.totalPages && homeData.bookOfMonth.pages) {
			homeData.progress.totalPages = Number(homeData.bookOfMonth.pages) || 0;
		}

		// manter o status do capítulo conforme fornecido pelo backend para que o progresso do usuário seja visível

		return homeData;
	} catch (error) {
		throw error;
	}
}

export async function updateHomeProgress(progressData) {
	const normalizedProgress = normalizeProgress(progressData);

	try {
		const response = await api.put(`/api/v1/home/progress`, normalizedProgress);
		const result = response.data?.item || response.data;
		return normalizeProgress(result || normalizedProgress);
	} catch (error) {
		throw error;
	}
}

export async function updateChapterStatus(bookId, chapterId, status) {
	const normalized = {
		id: Number(chapterId),
		status: String(status),
	};

	try {
		const response = await api.put(`/api/v1/books/${bookId}/chapters/${chapterId}/status`, { status: normalized.status });
		const result = response?.data?.item || response?.data || null;
		if (!result) return null;
		return normalizeChapter(result, 0);
	} catch (error) {
		// Não fatal: o chamador irá tratar a atualização otimista
		return null;
	}
}

export async function toggleHomeHighlightLike(highlightId, liked) {
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

	try {
		const response = await api.post(`/api/v1/books/${bookData.id}/set-book-of-month`);
		const result = response.data?.item || response.data;
		const normalized = normalizeBookOfMonth(result || payload);
		return normalized;
	} catch (error) {
		throw error;
	}
}
