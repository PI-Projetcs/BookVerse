const COVER_FALLBACK = 'https://placehold.co/240x320/f3f4f6/111827?text=Capa';

export const MOCK_BOOK_OF_MONTH = {
	id: 1,
	monthLabel: 'Marco 2026',
	title: 'O Nome do Vento',
	author: 'Patrick Rothfuss',
	description: 'A historia de Kvothe, um jovem prodigio que se torna uma lenda viva em seu proprio tempo.',
	members: 127,
	dateLabel: '1 de mar., 2026',
	coverUrl: COVER_FALLBACK,
};

export const MOCK_PROGRESS = {
	currentPage: 248,
	totalPages: 662,
	weeklyDone: 124,
	weeklyGoal: 165,
};

export const MOCK_CHAPTERS = [
	{ id: 1, title: 'Uma Pedra no Caminho', status: 'Concluido', state: 'done' },
	{ id: 2, title: 'Um Belo Dia', status: 'Concluido', state: 'done' },
	{ id: 3, title: 'Madeira e Palavra', status: 'Em andamento', state: 'active' },
	{ id: 4, title: 'O Vinho e o Sangue', status: 'Bloqueado', state: 'locked' },
	{ id: 5, title: 'Notas', status: 'Bloqueado', state: 'locked' },
];

export const MOCK_HIGHLIGHTS = [
	{ id: 'h1', text: 'E preciso ser um pouco louco para ser musico.', author: 'Ana Silva', likes: 23, liked: false },
	{ id: 'h2', text: 'Nao ha magica maior do que uma historia bem contada.', author: 'Carlos Mendes', likes: 18, liked: false },
];
