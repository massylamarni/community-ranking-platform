-- Flyway migration V6 – seed data for rankings and votes

-- Allow 'day' period and optional category for global archive
ALTER TABLE rankings MODIFY COLUMN period_type ENUM('day', 'week', 'month', 'year') NOT NULL;
ALTER TABLE rankings MODIFY COLUMN category_id INT NULL;

-- Additional users for voting
INSERT IGNORE INTO users (username, email, password_hash, is_admin) VALUES
    ('david',   'david@numero1.fr',   '$2a$10$zN3y35eJbF5/KVuOJEV1hukT/RYoQi/mci6altllMnjuhoPvSwa2q', FALSE),
    ('emma',    'emma@numero1.fr',    '$2a$10$zN3y35eJbF5/KVuOJEV1hukT/RYoQi/mci6altllMnjuhoPvSwa2q', FALSE),
    ('fiona',   'fiona@numero1.fr',   '$2a$10$zN3y35eJbF5/KVuOJEV1hukT/RYoQi/mci6altllMnjuhoPvSwa2q', FALSE),
    ('gabriel', 'gabriel@numero1.fr', '$2a$10$zN3y35eJbF5/KVuOJEV1hukT/RYoQi/mci6altllMnjuhoPvSwa2q', FALSE);

-- Votes with timestamps across different periods (today, yesterday, last week, last month)
INSERT IGNORE INTO votes (oeuvre_id, user_id, value, created_at)
SELECT o.oeuvre_id, u.user_id, v.val, v.ts
FROM (
    -- Today's votes
    SELECT 'david',   'Lumière d''Automne',   1, NOW() UNION ALL
    SELECT 'david',   'Le Cri Silencieux',    1, NOW() UNION ALL
    SELECT 'emma',    'Lumière d''Automne',   1, NOW() UNION ALL
    SELECT 'emma',    'Fragments d''Acier',   1, NOW() UNION ALL
    -- Yesterday's votes
    SELECT 'fiona',   'Fragments d''Acier',   1, DATE_SUB(NOW(), INTERVAL 1 DAY) UNION ALL
    SELECT 'fiona',   'Urbanisme Poétique',  -1, DATE_SUB(NOW(), INTERVAL 1 DAY) UNION ALL
    -- Last week's votes
    SELECT 'gabriel', 'Urbanisme Poétique',   1, DATE_SUB(NOW(), INTERVAL 8 DAY) UNION ALL
    SELECT 'gabriel', 'Le Cri Silencieux',   -1, DATE_SUB(NOW(), INTERVAL 8 DAY) UNION ALL
    -- Last month's votes
    SELECT 'david',   'Urbanisme Poétique',   1, DATE_SUB(NOW(), INTERVAL 35 DAY) UNION ALL
    SELECT 'emma',    'Le Cri Silencieux',    1, DATE_SUB(NOW(), INTERVAL 35 DAY)
) AS v(uname, title, val, ts)
JOIN users   u ON u.username = v.uname
JOIN oeuvres o ON o.title    = v.title;

-- Synchronize oeuvres score with net sum of votes
UPDATE oeuvres o
SET o.score = COALESCE((
    SELECT SUM(v.value)
    FROM votes v
    WHERE v.oeuvre_id = o.oeuvre_id
), 0);

-- Seed historical / archived rankings
-- Global weekly ranking archive (week starting 2026-09-28)
INSERT IGNORE INTO rankings (category_id, period_type, period_start, rank_position, oeuvre_id, score)
SELECT NULL, 'week', '2026-09-28', r.pos, o.oeuvre_id, r.sc
FROM (
    SELECT 'Fragments d''Acier', 1, 15 UNION ALL
    SELECT 'Lumière d''Automne', 2, 14 UNION ALL
    SELECT 'Le Cri Silencieux',  3, 11 UNION ALL
    SELECT 'Urbanisme Poétique', 4, 8
) AS r(title, pos, sc)
JOIN oeuvres o ON o.title = r.title;

-- Weekly ranking archive by category (week starting 2026-09-28)
INSERT IGNORE INTO rankings (category_id, period_type, period_start, rank_position, oeuvre_id, score)
SELECT c.category_id, 'week', '2026-09-28', r.pos, o.oeuvre_id, r.sc
FROM (
    SELECT 'Photographie', 'Lumière d''Automne', 1, 14 UNION ALL
    SELECT 'Photographie', 'Urbanisme Poétique', 2, 8 UNION ALL
    SELECT 'Peinture',     'Le Cri Silencieux',  1, 11 UNION ALL
    SELECT 'Sculpture',    'Fragments d''Acier', 1, 15
) AS r(cat_name, title, pos, sc)
JOIN categories c ON c.name  = r.cat_name
JOIN oeuvres    o ON o.title = r.title;

-- Global monthly ranking archive (month starting 2026-09-01)
INSERT IGNORE INTO rankings (category_id, period_type, period_start, rank_position, oeuvre_id, score)
SELECT NULL, 'month', '2026-09-01', r.pos, o.oeuvre_id, r.sc
FROM (
    SELECT 'Fragments d''Acier', 1, 30 UNION ALL
    SELECT 'Lumière d''Automne', 2, 28 UNION ALL
    SELECT 'Le Cri Silencieux',  3, 22 UNION ALL
    SELECT 'Urbanisme Poétique', 4, 19
) AS r(title, pos, sc)
JOIN oeuvres o ON o.title = r.title;

-- Monthly ranking archive by category (month starting 2026-09-01)
INSERT IGNORE INTO rankings (category_id, period_type, period_start, rank_position, oeuvre_id, score)
SELECT c.category_id, 'month', '2026-09-01', r.pos, o.oeuvre_id, r.sc
FROM (
    SELECT 'Photographie', 'Lumière d''Automne', 1, 28 UNION ALL
    SELECT 'Photographie', 'Urbanisme Poétique', 2, 19 UNION ALL
    SELECT 'Peinture',     'Le Cri Silencieux',  1, 22 UNION ALL
    SELECT 'Sculpture',    'Fragments d''Acier', 1, 30
) AS r(cat_name, title, pos, sc)
JOIN categories c ON c.name  = r.cat_name
JOIN oeuvres    o ON o.title = r.title;
