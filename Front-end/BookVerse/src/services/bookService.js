import api from './api';

// Serviço de livros do BookVerse.
// Tecnologias utilizadas: Axios via api e funções puras de mapeamento/normalização.
// Objetivo: centralizar catálogo, capítulos, discussões, comentários e avaliações.
// Observações: o serviço adapta contratos diferentes entre frontend e backend sem mudar a rede.

// Converte o critério de ordenação do frontend para o nome esperado pelo backend.
// Tecnologias utilizadas: comparação de strings.
// Objetivo: garantir que a busca de catálogo peça a ordenação correta à API.
// Observações: o fallback mantém a ordenação padrão por título.
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

// Monta o payload de livro no formato do backend.
// Tecnologias utilizadas: objetos literais e fallback de campos em português/inglês.
// Objetivo: permitir criação e edição sem depender do nome original dos campos no UI.
// Observações: capítulos são enviados em dois formatos para maximizar compatibilidade.
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
		// Incluir payload de capítulos para permitir que o backend persista a lista de capítulos
		chapters: Array.isArray(bookData?.chapters)
			? bookData.chapters.map((ch, idx) => ({ id: ch?.id ?? idx + 1, title: ch?.title || ch }))
			: undefined,
		capitulos: Array.isArray(bookData?.chapters)
			? bookData.chapters.map((ch, idx) => ({ id: ch?.id ?? idx + 1, titulo: ch?.title || ch }))
			: undefined,
	};
}

// Normaliza um livro para o formato consumido pela UI.
// Tecnologias utilizadas: coercão numérica e fallback de texto.
// Objetivo: padronizar título, autor, ano, gênero, capa e capítulos.
// Observações: reduz ramificações na tela ao tratar respostas inconsistentes do backend.
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

// Aplica a normalização de livro sobre uma lista inteira.
// Tecnologias utilizadas: Array.map.
// Objetivo: transformar coleções de livros em um formato uniforme.
// Observações: reutiliza o mesmo normalizador para evitar duplicação de lógica.
function normalizeList(items = []) {
	return items.map((item, index) => normalizeBook(item, index));
}

// Filtra e ordena livros conforme busca e critério de ordenação.
// Tecnologias utilizadas: Array.filter, Array.sort e localeCompare.
// Objetivo: entregar o catálogo pronto para exibição na home ou listagens.
// Observações: a busca considera autor, gênero e biografia do autor.
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



// Normaliza um comentário de discussão para o formato da UI.
// Tecnologias utilizadas: Number, Date.now e fallback de avatar.
// Objetivo: padronizar dados de comentários independentes da origem.
// Observações: o reported fica explícito para apoiar a moderação.
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

// Normaliza um capítulo com sua lista de comentários.
// Tecnologias utilizadas: Array.map e fallback de título.
// Objetivo: preparar threads de discussão para a tela de fórum.
// Observações: cada capítulo já sai com comentários uniformizados.
function normalizeChapter(chapter = {}, index = 0) {
	const comments = Array.isArray(chapter.comments) ? chapter.comments : [];
	return {
		id: Number(chapter.id ?? index + 1),
		title: chapter.title || `Capitulo ${index + 1}`,
		comments: comments.map((comment, commentIndex) => normalizeComment(comment, commentIndex)),
	};
}

// Normaliza uma coleção de discussões/capítulos.
// Tecnologias utilizadas: Array.map.
// Objetivo: reaproveitar a estrutura de capítulos nas listas do app.
// Observações: facilita a renderização de discussões vinculadas ao livro.
function normalizeDiscussions(items = []) {
	return items.map((item, index) => normalizeChapter(item, index));
}



// Extrai uma coleção de payloads em formatos diferentes.
// Tecnologias utilizadas: Array.isArray e acesso defensivo a propriedades.
// Objetivo: suportar respostas do backend em array, content, items ou data.
// Observações: reduz dependência do shape exato retornado pela API.
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

// Formata datas de comentário para leitura em pt-BR.
// Tecnologias utilizadas: Date e toLocaleDateString.
// Objetivo: exibir datas mais amigáveis na UI de discussões.
// Observações: retorna o valor original quando a data não é válida.
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

// Normaliza comentários retornados pelo backend do livro/discussão.
// Tecnologias utilizadas: Number, Date e fallback de campos legados.
// Objetivo: alinhar comentários da API ao formato esperado pelas telas.
// Observações: inclui ids de usuário e discussão para moderação e interação.
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

// Normaliza uma discussão do backend com sua lista de comentários.
// Tecnologias utilizadas: normalização de campos e Array.map.
// Objetivo: montar o fórum por capítulo com título, descrição e comentários.
// Observações: ajuda a tela de discussão a trabalhar com um objeto único por thread.
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

// Busca comentários aprovados com fallback para o endpoint legado.
// Tecnologias utilizadas: api.get e normalização de comentários.
// Objetivo: exibir comentários visíveis na discussão com compatibilidade entre versões.
// Observações: o fallback protege ambientes onde o endpoint /approved ainda não existe.
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



// Busca livros do catálogo com ordenação e filtro de busca.
// Tecnologias utilizadas: api.get, normalizeList e filterAndSortBooks.
// Objetivo: alimentar a home e a tela de catálogo com livros ativos.
// Observações: suporta múltiplos formatos de resposta sem quebrar a listagem.
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

// Busca um livro pelo identificador.
// Tecnologias utilizadas: api.get e normalizeBook.
// Objetivo: carregar detalhes completos para a tela do livro.
// Observações: aceita resposta embrulhada em item ou objeto direto.
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

// Busca livros para administração incluindo itens inativos.
// Tecnologias utilizadas: api.get e normalizeList.
// Objetivo: alimentar telas de manutenção e edição do catálogo.
// Observações: a ordenação por id desc facilita localizar registros recentes.
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

// Cria um livro no backend.
// Tecnologias utilizadas: api.post e toBackendBookPayload.
// Objetivo: persistir novos livros com o formato esperado pela API.
// Observações: o retorno é normalizado para uso imediato na UI administrativa.
export async function createAdminBook(bookData) {
	const response = await api.post(`/api/v1/books`, toBackendBookPayload(bookData));
	if (response.data?.item) {
		return normalizeBook(response.data.item);
	}

	return normalizeBook(response.data);
}

// Atualiza os dados de um livro existente.
// Tecnologias utilizadas: api.put e toBackendBookPayload.
// Objetivo: salvar alterações de cadastro e capítulos.
// Observações: o id é repassado diretamente para manter compatibilidade com a API.
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

// Atualiza somente o estado ativo/inativo de um livro.
// Tecnologias utilizadas: api.patch e normalização de livro.
// Objetivo: alternar disponibilidade sem reenviar todo o cadastro.
// Observações: melhora a UX ao tornar a ação mais rápida e focada.
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

// Remove um livro do catálogo.
// Tecnologias utilizadas: api.delete.
// Objetivo: excluir registros administrativos com uma chamada simples.
// Observações: retorna true para padronizar o consumo em callbacks de confirmação.
export async function deleteAdminBook(bookId) {
	const normalizedBookId = Number(bookId);

	try {
		await api.delete(`/api/v1/books/${bookId}`);
		return true;
	} catch (error) {
		throw error;
	}
}

// Busca discussões de um livro e anexa os comentários aprovados.
// Tecnologias utilizadas: api.get, Promise.all e normalizeBackendDiscussion.
// Objetivo: montar as threads usadas na tela de discussão por capítulo.
// Observações: se a busca de comentários falhar, a discussão segue vazia em vez de quebrar.
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

// Cria uma discussão para um capítulo quando ela ainda não existe.
// Tecnologias utilizadas: api.post e fallback de título/descrição.
// Objetivo: garantir espaço de comentários mesmo sem thread prévia.
// Observações: o retorno já vem pronto para renderização na tela de discussão.
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

// Busca todos os comentários de uma discussão.
// Tecnologias utilizadas: api.get e normalizeBackendComment.
// Objetivo: alimentar telas que exibem a thread completa.
// Observações: reaproveita o mesmo normalizador usado nos demais fluxos de comentários.
export async function getCommentsByDiscussion(discussionId) {
	const response = await api.get(`/api/v1/comments/discussion/${discussionId}`);
	return extractCollection(response.data).map(normalizeBackendComment);
}

// Busca apenas os comentários aprovados de uma discussão.
// Tecnologias utilizadas: api.get e normalizeBackendComment.
// Objetivo: exibir conteúdo público da thread sem itens pendentes.
// Observações: útil para a home e para discussões com moderação ativa.
export async function getApprovedCommentsByDiscussion(discussionId) {
    const response = await api.get(`/api/v1/comments/discussion/${discussionId}/approved`);
    return extractCollection(response.data).map(normalizeBackendComment);
}

// Cria um comentário em uma discussão.
// Tecnologias utilizadas: api.post e normalizeBackendComment.
// Objetivo: publicar respostas e comentários em uma thread.
// Observações: o payload é limpo com trim para evitar conteúdo em branco.
export async function createCommentOnDiscussion(discussionId, commentData) {
	const payload = {
		conteudo: String(commentData?.conteudo || commentData?.text || '').trim(),
		discussaoId: Number(discussionId),
	};

	const response = await api.post('/api/v1/comments', payload);
	const created = response.data?.item || response.data;
	return { item: normalizeBackendComment(created) };
}

// Adiciona um comentário a uma discussão de capítulo.
// Tecnologias utilizadas: createCommentOnDiscussion.
// Objetivo: manter uma interface mais semântica para chamadas por capítulo.
// Observações: preserva o contrato existente com o fluxo de discussão do app.
export async function addCommentToDiscussion(bookId, chapterId, commentData) {
	try {
		return createCommentOnDiscussion(chapterId, commentData);
	} catch (error) {
		throw error;
	}
}

// Publica um comentário na API de capítulo.
// Tecnologias utilizadas: api.post e normalizeBackendComment.
// Objetivo: enviar mensagens a partir da tela de discussão do livro.
// Observações: usa discussaoId como chave de vínculo com a thread.
export async function createChapterComment(chapterId, commentData) {
    const payload = {
        conteudo: String(commentData?.conteudo || '').trim(),
        discussaoId: Number(chapterId),
    };

    const response = await api.post('/api/v1/comments/chapter', payload);
    return normalizeBackendComment(response.data);
}

// Curte um comentário específico.
// Tecnologias utilizadas: api.post.
// Objetivo: registrar engajamento nas discussões.
// Observações: o retorno bruto é suficiente para a camada que chama atualizar a UI.
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

// Marca ou desmarca um comentário como reportado.
// Tecnologias utilizadas: api.post e boolean coercion.
// Objetivo: apoiar moderação e denúncia de conteúdo.
// Observações: o payload envia explicitamente o estado reportado para simplificar o backend.
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

// Base simulada para avaliações em memória.
// Tecnologias utilizadas: objeto local.
// Objetivo: oferecer ponto de apoio para cenários de desenvolvimento ou fallback.
// Observações: não é um estado persistente e não substitui a API real.
const mockRatingsStore = {};

// Normaliza avaliações para o formato usado na UI.
// Tecnologias utilizadas: leitura defensiva de status, autor e datas.
// Objetivo: padronizar notas, resenhas e metadados de moderação.
// Observações: mantém compatibilidade com campos legados em português e inglês.
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

// Envia uma nova avaliação para um livro.
// Tecnologias utilizadas: api.post e validação local de faixa.
// Objetivo: persistir notas e resenhas do usuário.
// Observações: bloqueia valores fora de 1 a 5 antes de chamar a API.
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

// Busca avaliações de um livro.
// Tecnologias utilizadas: api.get e normalizeRating.
// Objetivo: alimentar o resumo e os destaques da comunidade na tela de detalhes.
// Observações: retorna um objeto com items para manter contrato estável.
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

// Atualiza uma avaliação já existente.
// Tecnologias utilizadas: api.put e validação local de faixa.
// Objetivo: permitir edição da própria resenha sem criar nova nota.
// Observações: reaproveita o mesmo payload da criação para simplicidade.
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

// Remove a avaliação do usuário para um livro.
// Tecnologias utilizadas: api.delete.
// Objetivo: permitir excluir a contribuição do usuário do livro avaliado.
// Observações: devolve a resposta bruta ou um sucesso genérico para a UI.
export async function deleteBookRating(bookId) {
	try {
		const response = await api.delete(`/api/v1/books/${bookId}/ratings`);
		return response.data || { success: true };
	} catch (error) {
		throw error;
	}
}
