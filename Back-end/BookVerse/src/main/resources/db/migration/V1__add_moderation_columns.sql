-- Migration: add moderation columns to comments and ratings

ALTER TABLE comments
  ADD COLUMN admin_feedback TEXT NULL,
  ADD COLUMN moderated_by BIGINT NULL,
  ADD COLUMN moderated_at DATETIME NULL,
  ADD INDEX idx_comments_status (status),
  ADD CONSTRAINT fk_comments_moderated_by FOREIGN KEY (moderated_by) REFERENCES users(id);

ALTER TABLE ratings
  ADD COLUMN admin_feedback TEXT NULL,
  ADD COLUMN moderated_by BIGINT NULL,
  ADD COLUMN moderated_at DATETIME NULL,
  ADD INDEX idx_ratings_status (status),
  ADD CONSTRAINT fk_ratings_moderated_by FOREIGN KEY (moderated_by) REFERENCES users(id);

-- Note: This project uses Hibernate 'ddl-auto: update'. Run this SQL manually if you prefer explicit migrations.
