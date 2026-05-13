export const MOCK_USER = {
  id: 1,
  name: 'Matheus Davy',
  username: '@matheusdavy',
  email: 'matheus@email.com',

  profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',

  bio: 'Apaixonado por livros, tecnologia e desenvolvimento mobile.',

  stats: {
    livrosLidos: 12,
    favoritos: 5,
    resenhas: 8,
  },

  destaque: [
    {
      id: 1,
      titulo: 'O Hobbit',
      autor: 'J.R.R. Tolkien',
      capa: 'https://m.media-amazon.com/images/I/91b0C2YNSrL.jpg',
      avaliacao: 4.8,
      genero: 'Fantasia',
    },
    {
      id: 2,
      titulo: '1984',
      autor: 'George Orwell',
      capa: 'https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg',
      avaliacao: 4.7,
      genero: 'Ficção Científica',
    },
    {
      id: 3,
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      capa: 'https://m.media-amazon.com/images/I/81af+MCATTL.jpg',
      avaliacao: 4.5,
      genero: 'Romance',
    },
  ],

  categorias: [
    'Terror',
    'Suspense',
    'Aventura',
    'Ficção Científica',
    'Fantasia',
    'Romance',
    'Biografia',
  ],

  atividade: [
    { month: 'Janeiro',   books: 45, pct: 0.75, color: '#7D1F3E' },
    { month: 'Fevereiro', books: 38, pct: 0.63, color: '#0f766e' },
    { month: 'Março',     books: 52, pct: 0.87, color: '#B8941F' },
  ],
};