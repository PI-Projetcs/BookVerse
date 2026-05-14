use bookverse;

-- NOTA: Usuário admin (admin@bookverse.com / admin123) é criado automaticamente
-- no startup via AdminBootstrapConfig (veja Backend README).
-- Se preferir criar manualmente, desabilite BOOKVERSE_BOOTSTRAP_ADMIN_ENABLED.

INSERT INTO books
(titulo, autor, genero, ano, sinopse, media_avaliacao, destaque, destaque_data, cover_url)
VALUES
('Harry Potter e a Pedra Filosofal', 'J.K. Rowling', 'Fantasia', 1997, 'Primeiro ano de Harry em Hogwarts.', 4.8, b'0', NULL, 'https://covers.openlibrary.org/b/isbn/9780747532699-L.jpg'),
('Harry Potter e a Camara Secreta', 'J.K. Rowling', 'Fantasia', 1998, 'Segundo ano e a Camara Secreta.', 4.7, b'0', NULL, 'https://covers.openlibrary.org/b/isbn/9780439064873-L.jpg'),
('Harry Potter e o Prisioneiro de Azkaban', 'J.K. Rowling', 'Fantasia', 1999, 'Sirius Black e os dementadores.', 4.9, b'0', NULL, 'https://covers.openlibrary.org/b/isbn/9780439136365-L.jpg'),
('Harry Potter e o Calice de Fogo', 'J.K. Rowling', 'Fantasia', 2000, 'Torneio Tribruxo em Hogwarts.', 4.8, b'0', NULL, 'https://covers.openlibrary.org/b/isbn/9780439139601-L.jpg'),
('Harry Potter e a Ordem da Fenix', 'J.K. Rowling', 'Fantasia', 2003, 'Harry enfrenta o retorno de Voldemort e a resistencia do Ministerio.', 4.8, b'0', NULL, 'https://covers.openlibrary.org/b/isbn/9780439358071-L.jpg');
