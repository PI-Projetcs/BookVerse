CREATE DATABASE bookverse;

DROP DATABASE bookverse;

USE bookverse;

SHOW TABLES;

-- Credenciais de teste para login
-- Admin: admin@bookverse.com / admin123
-- User: user@test.com / user123

-- Cadastro inicial dos usuários de teste
INSERT INTO users (id, ativo, email, nome, role, senha) VALUES
(1, 1, 'admin@bookverse.com', 'Administrador', 'ADMIN', 'admin123'),
(2, 1, 'user@test.com', 'Usuario', 'USER', 'user123');

-- 1. Ver todos os Livros (incluindo a nova coluna cover_url)
SELECT * FROM books;

-- 2. Ver todos os Usuários e seus Cargos (Admin/User)
SELECT * FROM users;

-- 3. Ver todos os Comentários feitos nos livros
SELECT * FROM comments;

-- 4. Ver as Avaliações (Notas de 0 a 5) dadas pelos usuários
SELECT * FROM ratings;

-- 5. Ver o Histórico de Leitura (quem está lendo o quê)
SELECT * FROM reading_history;

-- 6. Ver as Discussões abertas sobre os livros
SELECT * FROM discussions;

-- 7. Ver todas as Conquistas disponíveis no sistema
SELECT * FROM achievements;

-- 8. Ver quais usuários ganharam quais conquistas
SELECT * FROM user_achievements;

SELECT * FROM comment_like;

SELECT * FROM chapter_progress;

SELECT * FROM highlight_like;

UPDATE users
SET ativo = 1
WHERE email = 'user@test.com';

UPDATE users
SET ativo = 1
WHERE email = 'admin@bookverse.com';

-- ============================================
-- CADASTRO DOS LIVROS INSERIDOS (com capa)
-- ============================================
-- Formato: ID | TITULO | AUTOR | GENERO | LINK_CAPA

-- 1  | E Assim que Acaba | Colleen Hoover | Romance | https://m.media-amazon.com/images/I/91r5G8RxqfL.jpg?utm_source=chatgpt.com
-- 2  | It: A Coisa | Stephen King | Terror | https://m.media-amazon.com/images/I/91g9Dvtf+jL.jpg?utm_source=chatgpt.com
-- 3  | Harry Potter e a Pedra Filosofal | J. K. Rowling | Fantasia | https://m.media-amazon.com/images/I/81ibfYk4qmL.jpg?utm_source=chatgpt.com
-- 4  | A Biblioteca da Meia-Noite | Matt Haig | Drama | https://m.media-amazon.com/images/I/81iqH8dpjuL.jpg?utm_source=chatgpt.com
-- 5  | O Poder do Habito | Charles Duhigg | Autoajuda | https://m.media-amazon.com/images/I/815iPX0SgkL.jpg?utm_source=chatgpt.com
-- 6  | Verity | Colleen Hoover | Suspense | https://m.media-amazon.com/images/I/91SDZ2eUj+L.jpg?utm_source=chatgpt.com
-- 7  | O Hobbit | J. R. R. Tolkien | Aventura | https://m.media-amazon.com/images/I/91b0C2YNSrL.jpg?utm_source=chatgpt.com
-- 8  | Steve Jobs | Walter Isaacson | Biografia | https://m.media-amazon.com/images/I/81VStYnDGrL.jpg?utm_source=chatgpt.com
-- 9  | Sapiens | Yuval Noah Harari | Historia | https://m.media-amazon.com/images/I/713jIoMO3UL.jpg?utm_source=chatgpt.com
-- 10 | Turma da Monica | Mauricio de Sousa | Infantojuvenil | https://covers.openlibrary.org/b/olid/OL25882679M-L.jpg
-- 11 | Toda Poesia | Paulo Leminski | Poesia | https://covers.openlibrary.org/b/olid/OL27146459M-L.jpg
-- 12 | A Culpa e das Estrelas | John Green | Romance | https://covers.openlibrary.org/b/olid/OL32036803M-L.jpg
-- 13 | Capitães da areia | Jorge Leal Amado de Faria | Drama | https://covers.openlibrary.org/b/olid/OL26330623M-L.jpg
-- 14 | Dom Casmurro | Autor nao informado | Drama | https://covers.openlibrary.org/b/olid/OL9157135M-L.jpg
-- 15 | Ostra Feliz Não Faz Pérola | Rubem Alves | Autoajuda | https://covers.openlibrary.org/b/olid/OL35664877M-L.jpg

-- Consulta rapida para verificar livros e capas no banco:
SELECT id, titulo, autor, genero, cover_url
FROM books
ORDER BY id;