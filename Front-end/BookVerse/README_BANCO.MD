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