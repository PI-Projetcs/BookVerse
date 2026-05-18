DROP DATABASE IF EXISTS bookverse;
CREATE DATABASE IF NOT EXISTS bookverse;

USE bookverse;

SHOW TABLES;

-- Credenciais de teste para login
-- Admin: admin@bookverse.com / admin123
-- User: user@test.com / user123

-- Exemplo de cadastro inicial dos usuarios de teste
-- INSERT INTO users (nome, email, senha, role) VALUES
-- ('Administrador', 'admin@bookverse.com', 'admin123', 'ADMIN'),
-- ('Usuario', 'user@test.com', 'user123', 'USER');

-- 1. Ver todos os Livros (incluindo a coluna cover_url)
SELECT * FROM books;

-- 2. Ver todos os Usuarios e seus Cargos (Admin/User)
SELECT * FROM users;

-- 3. Ver todos os Comentarios feitos nos livros
SELECT * FROM comments;

-- 4. Ver as Avaliacoes (Notas de 0 a 5) dadas pelos usuarios
SELECT * FROM ratings;

-- 5. Ver o Historico de Leitura (quem esta lendo o que)
SELECT * FROM reading_history;

-- 6. Ver as Discusses abertas sobre os livros
SELECT * FROM discussions;

-- 7. Ver todas as Conquistas disponiveis no sistema
SELECT * FROM achievements;

-- 8. Ver quais usuarios ganharam quais conquistas
SELECT * FROM user_achievements;

SELECT * FROM comment_like;

SELECT * FROM chapter_progress;

SELECT * FROM highlight_like;
