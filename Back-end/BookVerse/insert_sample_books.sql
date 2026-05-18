-- Inserir livros de exemplo no banco de dados

INSERT INTO books (titulo, autor, genero, ano, sinopse, cover_url, paginas, destaque, media_avaliacao) VALUES
('O Hobbit', 'J.R.R. Tolkien', 'Fantasia', 1937, 'Bilbo Bolseiro é um hobbit que vive uma vida confortável quando é convidado por Gandalf para uma aventura inesperada.', 'https://m.media-amazon.com/images/I/91mH9xpWvTL._SY466_.jpg', 310, true, 4.8),
('1984', 'George Orwell', 'Ficção Científica', 1949, 'Um romance distópico que retrata um futuro totalitário onde o governo controla todos os aspectos da vida.', 'https://m.media-amazon.com/images/I/91iI0oqiJTL._AC_UY218_.jpg', 328, false, 4.7),
('Orgulho e Preconceito', 'Jane Austen', 'Romance', 1813, 'Uma história clássica de amor e casamento na Inglaterra do século XIX, focando na vida de Elizabeth Bennet.', 'https://m.media-amazon.com/images/I/810CJ-aQWGL._AC_UY218_.jpg', 432, false, 4.6),
('O Cortiço', 'Aluísio Azevedo', 'Drama', 1890, 'Um romance realista que retrata a vida na cortiça do Rio de Janeiro no século XIX, explorando temas de classe social e moral.', 'https://m.media-amazon.com/images/I/71QvgALpzgL._AC_UY218_.jpg', 256, false, 4.4),
('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 'Infantojuvenil', 1943, 'Uma fábula poética sobre um jovem príncipe que viaja entre asteroides, explorando temas profundos sobre a vida e o sentido da existência.', 'https://m.media-amazon.com/images/I/91kdbPvDMHL._AC_UY218_.jpg', 96, false, 4.9),
('Dom Casmurro', 'Machado de Assis', 'Drama', 1899, 'Uma narrativa memorialista que explora temas de ciúme, desconfiança e a possível infidelidade em um casamento.', 'https://m.media-amazon.com/images/I/91lT5Z1xqEL._AC_UY218_.jpg', 256, false, 4.5),
('O Vendedor de Sonhos', 'Augusto Cury', 'Autoajuda', 2008, 'Uma jornada inspiradora sobre superação, autoconhecimento e a busca pela felicidade através de pequenas mudanças no cotidiano.', 'https://m.media-amazon.com/images/I/713j6-QGYSL._AC_UY218_.jpg', 376, false, 4.3),
('A Revolução dos Bichos', 'George Orwell', 'Ficção Científica', 1945, 'Uma alegoria política sobre a Revolução Russa, narrada através da perspectiva de animais que se rebelam contra o controle humano.', 'https://m.media-amazon.com/images/I/915TsHJbScL._AC_UY218_.jpg', 139, false, 4.6);

-- Capítulos de exemplo para O Hobbit
INSERT INTO book_chapters (book_id, chapter_order_index, chapter_order, chapter_title)
SELECT id, 0, 1, 'Uma festa inesperada' FROM books WHERE titulo = 'O Hobbit' LIMIT 1;

INSERT INTO book_chapters (book_id, chapter_order_index, chapter_order, chapter_title)
SELECT id, 1, 2, 'Carneiros Assados' FROM books WHERE titulo = 'O Hobbit' LIMIT 1;

INSERT INTO book_chapters (book_id, chapter_order_index, chapter_order, chapter_title)
SELECT id, 2, 3, 'Montanhas Perigosas' FROM books WHERE titulo = 'O Hobbit' LIMIT 1;

INSERT INTO book_chapters (book_id, chapter_order_index, chapter_order, chapter_title)
SELECT id, 3, 4, 'Enigmas no Escuro' FROM books WHERE titulo = 'O Hobbit' LIMIT 1;
