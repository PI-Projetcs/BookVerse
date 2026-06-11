import api from './api';
import { getDiscussions } from './bookService';

// Serviço da tela Home.
// Tecnologias utilizadas: Axios via api, normalizadores e funções puras.
// Objetivo: concentrar o view model da home, progresso, capítulos e destaques.
// Observações: a camada adapta respostas diferentes sem poluir a UI com regras de backend.

// Indica se o endpoint de status de capítulo já foi validado.
// Tecnologias utilizadas: estado de módulo.
// Objetivo: evitar repetir tentativas quando a API não suportar a rota.
// Observações: undefined significa ainda desconhecido.
let chapterStatusEndpointSupported = undefined; // undefined = desconhecido, false = não suportado, true = suportado

// Normaliza os dados do Livro do Mês.
// Tecnologias utilizadas: Number e fallback de textos/imagem.
// Objetivo: exibir o destaque principal da home com campos consistentes.
// Observações: aceita nomes em português e inglês vindos do backend.
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

// Normaliza o progresso de leitura do usuário.
// Tecnologias utilizadas: Number e Math.max.
// Objetivo: garantir valores válidos para barras e métricas de progresso.
// Observações: negativos e valores ausentes viram zero.
function normalizeProgress(progress = {}) {
	return {
		currentPage: Math.max(0, Number(progress.currentPage) || 0),
		totalPages: Math.max(0, Number(progress.totalPages) || 0),
		weeklyDone: Math.max(0, Number(progress.weeklyDone) || 0),
		weeklyGoal: Math.max(0, Number(progress.weeklyGoal) || 0),
	};
}

// Normaliza capítulos para o estado visual da home.
// Tecnologias utilizadas: String, Number e regras de estado derivado.
// Objetivo: transformar status textual em estados visuais da lista.
// Observações: prioriza locked, depois concluído e por fim em leitura.
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

// Normaliza destaques da comunidade.
// Tecnologias utilizadas: Boolean e coerção numérica.
// Objetivo: preparar cards de destaque com contagem de likes e estado curtido.
// Observações: gera fallback de id quando a API não retorna um identificador estável.
function normalizeHighlight(highlight = {}, index = 0) {
	return {
		id: highlight.id || `h${index + 1}`,
		text: highlight.text || '',
		author: highlight.author || 'Comunidade',
		likes: Math.max(0, Number(highlight.likes) || 0),
		liked: Boolean(highlight.liked),
	};
}

// Consolida o payload principal da home.
// Tecnologias utilizadas: leitura defensiva de objeto e mapeamento de listas.
// Objetivo: montar livro do mês, progresso, capítulos e destaques em um único objeto.
// Observações: suporta resposta embrulhada em item para manter compatibilidade.
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


// Conta autores únicos que comentaram nas discussões.
// Tecnologias utilizadas: Set e percorrimento de arrays.
// Objetivo: estimar o número de membros engajados no livro do mês.
// Observações: normaliza o texto para evitar duplicidades por caixa alta/baixa.

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

// Constrói um payload de Livro do Mês a partir de um livro selecionado.
// Tecnologias utilizadas: Date e reaproveitamento do normalizador do destaque.
// Objetivo: preparar os dados de exibição do livro em destaque.
// Observações: o monthLabel e o dateLabel são calculados no cliente.
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

// Busca e normaliza todo o view model da home.
// Tecnologias utilizadas: api.get, getDiscussions e normalização local.
// Objetivo: alimentar a tela com livro do mês, progresso, capítulos e destaques.
// Observações: se a busca de discussões falhar, o cartão principal continua funcional.
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
	// Atualiza o progresso de leitura do usuário.
	// Tecnologias utilizadas: api.put e normalizeProgress.
	// Objetivo: persistir páginas lidas e meta semanal sem sair da home.
	// Observações: o retorno normalizado mantém a UI sincronizada com o backend.
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
	// Atualiza o status visual e persistido de um capítulo.
	// Tecnologias utilizadas: api.put e normalizeChapter.
	// Objetivo: marcar leitura, conclusão ou limpeza do status na UI.
	// Observações: o fallback null permite atualização otimista sem quebrar a tela.
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
	// Alterna a curtida de um destaque da comunidade.
	// Tecnologias utilizadas: api.post e normalizeHighlight.
	// Objetivo: refletir a ação de like no card do destaque.
	// Observações: aceita liked boolean para evitar estados ambíguos.
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
	// Define o livro selecionado como Livro do Mês.
	// Tecnologias utilizadas: api.post e normalizeBookOfMonth.
	// Objetivo: atualizar a vitrine principal mostrada na home.
	// Observações: usa fallback do payload local quando a API não devolve item completo.
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
