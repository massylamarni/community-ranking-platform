-- Additional demo data for comments, votes, and archived rankings.

INSERT IGNORE INTO users (username, email, password_hash, is_admin) VALUES
    ('henri', 'henri@numero1.fr', '$2a$10$zN3y35eJbF5/KVuOJEV1hukT/RYoQi/mci6altllMnjuhoPvSwa2q', FALSE),
    ('ines',  'ines@numero1.fr',  '$2a$10$zN3y35eJbF5/KVuOJEV1hukT/RYoQi/mci6altllMnjuhoPvSwa2q', FALSE);

INSERT IGNORE INTO oeuvres (title, description, image_url, author_id, status) VALUES
    ('Éclats de lumière',
     'Une étude photographique des reflets au lever du jour.',
     NULL,
     (SELECT user_id FROM users WHERE username = 'david'),
     'approved'),
    ('Jardin de silence',
     'Une composition picturale inspirée par les jardins après la pluie.',
     NULL,
     (SELECT user_id FROM users WHERE username = 'emma'),
     'approved'),
    ('Matière vivante',
     'Une sculpture qui associe formes organiques et matériaux récupérés.',
     NULL,
     (SELECT user_id FROM users WHERE username = 'fiona'),
     'approved'),
    ('Ville en mouvement',
     'Une série photographique consacrée aux rythmes de la ville.',
     NULL,
     (SELECT user_id FROM users WHERE username = 'gabriel'),
     'approved');

INSERT IGNORE INTO oeuvre_categories (oeuvre_id, category_id)
SELECT o.oeuvre_id, c.category_id
FROM oeuvres o
JOIN categories c ON
    (o.title = 'Éclats de lumière' AND c.name = 'Photographie') OR
    (o.title = 'Jardin de silence' AND c.name = 'Peinture') OR
    (o.title = 'Matière vivante' AND c.name = 'Sculpture') OR
    (o.title = 'Ville en mouvement' AND c.name = 'Photographie');

INSERT INTO comments (oeuvre_id, user_id, parent_comment_id, content, created_at)
SELECT o.oeuvre_id, u.user_id, NULL, seed.content, seed.created_at
FROM (
    SELECT 'alice' AS username, 'Éclats de lumière' AS title,
           'La lumière et les reflets donnent beaucoup de profondeur à cette image.' AS content,
           '2026-10-16 09:15:00' AS created_at
    UNION ALL SELECT 'bob', 'Éclats de lumière',
           'Très belle palette de couleurs, surtout dans le ciel.',
           '2026-10-16 10:20:00'
    UNION ALL SELECT 'charlie', 'Jardin de silence',
           'La composition est apaisante et les détails sont soignés.',
           '2026-10-16 11:05:00'
    UNION ALL SELECT 'david', 'Jardin de silence',
           'Les textures rendent cette scène particulièrement vivante.',
           '2026-10-16 12:10:00'
    UNION ALL SELECT 'alice', 'Matière vivante',
           'Le contraste entre les matières fonctionne très bien.',
           '2026-10-16 13:00:00'
    UNION ALL SELECT 'bob', 'Matière vivante',
           'Une forme originale qui attire immédiatement le regard.',
           '2026-10-16 14:25:00'
    UNION ALL SELECT 'charlie', 'Ville en mouvement',
           'Le cadrage transmet bien l’énergie de la rue.',
           '2026-10-16 15:30:00'
    UNION ALL SELECT 'emma', 'Ville en mouvement',
           'J’aime beaucoup le jeu entre les lignes et les passants.',
           '2026-10-16 16:40:00'
) AS seed
JOIN users u ON u.username = seed.username
JOIN oeuvres o ON o.title = seed.title
WHERE NOT EXISTS (
    SELECT 1
    FROM comments existing
    WHERE existing.oeuvre_id = o.oeuvre_id
      AND existing.user_id = u.user_id
      AND existing.content = seed.content
);

INSERT INTO comments (oeuvre_id, user_id, parent_comment_id, content, created_at)
SELECT o.oeuvre_id, u.user_id, parent.comment_id, seed.content, seed.created_at
FROM (
    SELECT 'ines' AS username, 'Éclats de lumière' AS title,
           'La lumière et les reflets donnent beaucoup de profondeur à cette image.' AS parent_content,
           'Merci, j’ai voulu conserver la douceur de cette lumière.' AS content,
           '2026-10-16 17:00:00' AS created_at
    UNION ALL SELECT 'henri', 'Matière vivante',
           'Le contraste entre les matières fonctionne très bien.',
           'Le métal récupéré apporte justement ce contraste.',
           '2026-10-16 17:10:00'
) AS seed
JOIN users u ON u.username = seed.username
JOIN oeuvres o ON o.title = seed.title
JOIN comments parent
    ON parent.oeuvre_id = o.oeuvre_id
   AND parent.content = seed.parent_content
WHERE NOT EXISTS (
    SELECT 1
    FROM comments existing
    WHERE existing.oeuvre_id = o.oeuvre_id
      AND existing.user_id = u.user_id
      AND existing.content = seed.content
);

INSERT IGNORE INTO votes (oeuvre_id, user_id, value, created_at)
SELECT o.oeuvre_id, u.user_id, seed.vote_value, seed.created_at
FROM (
    SELECT 'alice' AS username, 'Éclats de lumière' AS title, 1 AS vote_value,
           '2025-01-10 10:00:00' AS created_at
    UNION ALL SELECT 'bob', 'Éclats de lumière', 1, '2025-01-12 10:00:00'
    UNION ALL SELECT 'charlie', 'Éclats de lumière', 1, '2026-08-03 10:00:00'
    UNION ALL SELECT 'emma', 'Éclats de lumière', -1, '2026-08-12 10:00:00'
    UNION ALL SELECT 'fiona', 'Éclats de lumière', 1, '2026-10-05 10:00:00'
    UNION ALL SELECT 'gabriel', 'Éclats de lumière', 1, '2026-10-06 10:00:00'
    UNION ALL SELECT 'henri', 'Éclats de lumière', 1, '2026-10-16 10:00:00'
    UNION ALL SELECT 'ines', 'Éclats de lumière', 1, '2026-10-16 11:00:00'
    UNION ALL SELECT 'alice', 'Jardin de silence', 1, '2025-01-10 10:00:00'
    UNION ALL SELECT 'charlie', 'Jardin de silence', 1, '2025-01-12 10:00:00'
    UNION ALL SELECT 'bob', 'Jardin de silence', 1, '2026-08-03 10:00:00'
    UNION ALL SELECT 'david', 'Jardin de silence', 1, '2026-08-12 10:00:00'
    UNION ALL SELECT 'fiona', 'Jardin de silence', 1, '2026-10-05 10:00:00'
    UNION ALL SELECT 'gabriel', 'Jardin de silence', -1, '2026-10-06 10:00:00'
    UNION ALL SELECT 'henri', 'Jardin de silence', 1, '2026-10-16 10:00:00'
    UNION ALL SELECT 'ines', 'Jardin de silence', 1, '2026-10-16 11:00:00'
    UNION ALL SELECT 'alice', 'Matière vivante', 1, '2025-01-10 10:00:00'
    UNION ALL SELECT 'bob', 'Matière vivante', -1, '2025-01-12 10:00:00'
    UNION ALL SELECT 'charlie', 'Matière vivante', 1, '2026-08-03 10:00:00'
    UNION ALL SELECT 'david', 'Matière vivante', 1, '2026-08-12 10:00:00'
    UNION ALL SELECT 'emma', 'Matière vivante', 1, '2026-10-05 10:00:00'
    UNION ALL SELECT 'gabriel', 'Matière vivante', 1, '2026-10-06 10:00:00'
    UNION ALL SELECT 'henri', 'Matière vivante', 1, '2026-10-16 10:00:00'
    UNION ALL SELECT 'ines', 'Matière vivante', -1, '2026-10-16 11:00:00'
    UNION ALL SELECT 'alice', 'Ville en mouvement', 1, '2025-01-10 10:00:00'
    UNION ALL SELECT 'charlie', 'Ville en mouvement', 1, '2025-01-12 10:00:00'
    UNION ALL SELECT 'bob', 'Ville en mouvement', 1, '2026-08-03 10:00:00'
    UNION ALL SELECT 'david', 'Ville en mouvement', -1, '2026-08-12 10:00:00'
    UNION ALL SELECT 'emma', 'Ville en mouvement', 1, '2026-10-05 10:00:00'
    UNION ALL SELECT 'fiona', 'Ville en mouvement', 1, '2026-10-06 10:00:00'
    UNION ALL SELECT 'henri', 'Ville en mouvement', 1, '2026-10-16 10:00:00'
    UNION ALL SELECT 'ines', 'Ville en mouvement', 1, '2026-10-16 11:00:00'
) AS seed
JOIN users u ON u.username = seed.username
JOIN oeuvres o ON o.title = seed.title;

INSERT INTO vote_history (vote_id, oeuvre_id, user_id, value, event_at)
SELECT v.vote_id, v.oeuvre_id, v.user_id, v.value, v.created_at
FROM votes v
JOIN oeuvres o ON o.oeuvre_id = v.oeuvre_id
LEFT JOIN vote_history vh ON vh.vote_id = v.vote_id
WHERE o.title IN (
    'Éclats de lumière',
    'Jardin de silence',
    'Matière vivante',
    'Ville en mouvement'
)
AND vh.history_id IS NULL;

UPDATE oeuvres o
SET o.score = COALESCE((
    SELECT SUM(v.value)
    FROM votes v
    WHERE v.oeuvre_id = o.oeuvre_id
), 0)
WHERE o.title IN (
    'Éclats de lumière',
    'Jardin de silence',
    'Matière vivante',
    'Ville en mouvement'
);

INSERT INTO rankings (category_id, period_type, period_start, rank_position, oeuvre_id, score)
SELECT c.category_id, seed.period_type, seed.period_start, seed.rank_position, o.oeuvre_id, seed.score
FROM (
    SELECT 'year' AS period_type, '2025-01-01' AS period_start, NULL AS category_name,
           'Éclats de lumière' AS title, 1 AS rank_position, 2 AS score
    UNION ALL SELECT 'year', '2025-01-01', NULL, 'Jardin de silence', 2, 2
    UNION ALL SELECT 'year', '2025-01-01', NULL, 'Ville en mouvement', 3, 2
    UNION ALL SELECT 'year', '2025-01-01', NULL, 'Matière vivante', 4, 0
    UNION ALL SELECT 'month', '2026-08-01', NULL, 'Jardin de silence', 1, 2
    UNION ALL SELECT 'month', '2026-08-01', NULL, 'Matière vivante', 2, 2
    UNION ALL SELECT 'month', '2026-08-01', NULL, 'Éclats de lumière', 3, 0
    UNION ALL SELECT 'month', '2026-08-01', NULL, 'Ville en mouvement', 4, 0
    UNION ALL SELECT 'week', '2026-10-05', NULL, 'Éclats de lumière', 1, 2
    UNION ALL SELECT 'week', '2026-10-05', NULL, 'Matière vivante', 2, 2
    UNION ALL SELECT 'week', '2026-10-05', NULL, 'Ville en mouvement', 3, 2
    UNION ALL SELECT 'week', '2026-10-05', NULL, 'Jardin de silence', 4, 0
    UNION ALL SELECT 'day', '2026-10-16', NULL, 'Éclats de lumière', 1, 2
    UNION ALL SELECT 'day', '2026-10-16', NULL, 'Jardin de silence', 2, 2
    UNION ALL SELECT 'day', '2026-10-16', NULL, 'Ville en mouvement', 3, 2
    UNION ALL SELECT 'day', '2026-10-16', NULL, 'Matière vivante', 4, 0
    UNION ALL SELECT 'year', '2025-01-01', 'Photographie', 'Éclats de lumière', 1, 2
    UNION ALL SELECT 'year', '2025-01-01', 'Photographie', 'Ville en mouvement', 2, 2
    UNION ALL SELECT 'year', '2025-01-01', 'Peinture', 'Jardin de silence', 1, 2
    UNION ALL SELECT 'year', '2025-01-01', 'Sculpture', 'Matière vivante', 1, 0
    UNION ALL SELECT 'month', '2026-08-01', 'Photographie', 'Ville en mouvement', 1, 0
    UNION ALL SELECT 'month', '2026-08-01', 'Photographie', 'Éclats de lumière', 2, 0
    UNION ALL SELECT 'month', '2026-08-01', 'Peinture', 'Jardin de silence', 1, 2
    UNION ALL SELECT 'month', '2026-08-01', 'Sculpture', 'Matière vivante', 1, 2
    UNION ALL SELECT 'week', '2026-10-05', 'Photographie', 'Éclats de lumière', 1, 2
    UNION ALL SELECT 'week', '2026-10-05', 'Photographie', 'Ville en mouvement', 2, 2
    UNION ALL SELECT 'week', '2026-10-05', 'Peinture', 'Jardin de silence', 1, 0
    UNION ALL SELECT 'week', '2026-10-05', 'Sculpture', 'Matière vivante', 1, 2
    UNION ALL SELECT 'day', '2026-10-16', 'Photographie', 'Éclats de lumière', 1, 2
    UNION ALL SELECT 'day', '2026-10-16', 'Photographie', 'Ville en mouvement', 2, 2
    UNION ALL SELECT 'day', '2026-10-16', 'Peinture', 'Jardin de silence', 1, 2
    UNION ALL SELECT 'day', '2026-10-16', 'Sculpture', 'Matière vivante', 1, 0
) AS seed
LEFT JOIN categories c ON c.name = seed.category_name
JOIN oeuvres o ON o.title = seed.title
WHERE (seed.category_name IS NULL OR c.category_id IS NOT NULL)
AND NOT EXISTS (
    SELECT 1
    FROM rankings existing
    WHERE existing.period_type = seed.period_type
      AND existing.period_start = seed.period_start
      AND existing.category_id <=> c.category_id
      AND existing.oeuvre_id = o.oeuvre_id
);
