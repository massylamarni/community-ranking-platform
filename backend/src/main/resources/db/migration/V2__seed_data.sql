-- Flyway migration V2 – seed data

INSERT IGNORE INTO categories (name) VALUES
    ('Peinture'),
    ('Sculpture'),
    ('Photographie'),
    ('Littérature'),
    ('Musique'),
    ('Cinéma'),
    ('Design');

-- Users
-- password_hash below is BCrypt of "Password123!"
INSERT IGNORE INTO users (username, email, password_hash, is_admin) VALUES
    ('admin',   'admin@numero1.fr',   '$2a$10$zN3y35eJbF5/KVuOJEV1hukT/RYoQi/mci6altllMnjuhoPvSwa2q', TRUE),
    ('alice',   'alice@numero1.fr',   '$2a$10$zN3y35eJbF5/KVuOJEV1hukT/RYoQi/mci6altllMnjuhoPvSwa2q', FALSE),
    ('bob',     'bob@numero1.fr',     '$2a$10$zN3y35eJbF5/KVuOJEV1hukT/RYoQi/mci6altllMnjuhoPvSwa2q', FALSE),
    ('charlie', 'charlie@numero1.fr', '$2a$10$zN3y35eJbF5/KVuOJEV1hukT/RYoQi/mci6altllMnjuhoPvSwa2q', FALSE);


INSERT IGNORE INTO oeuvres (title, description, image_url, author_id, status) VALUES
    ('Le Cri Silencieux',
     'Une peinture abstraite explorant les émotions enfouies.',
     NULL,
     2,
     'approved'),

    ('Lumière d''Automne',
     'Photographie en noir et blanc d''une forêt en automne.',
     NULL,
     3,
     'approved'),

    ('Fragments d''Acier',
     'Sculpture moderne composée de pièces métalliques récupérées.',
     NULL,
     4,
     'approved'),

    ('Mélodie Inachevée',
     'Composition musicale laissée volontairement ouverte à l''interprétation.',
     NULL,
     2,
     'pending'),

    ('Urbanisme Poétique',
     'Série de photographies sur l''architecture urbaine moderne.',
     NULL,
     3,
     'approved');


INSERT IGNORE INTO oeuvre_categories (oeuvre_id, category_id)
SELECT o.oeuvre_id, c.category_id
FROM oeuvres o
JOIN categories c ON
    (o.title = 'Le Cri Silencieux'   AND c.name = 'Peinture')      OR
    (o.title = 'Lumière d''Automne'  AND c.name = 'Photographie')  OR
    (o.title = 'Fragments d''Acier'  AND c.name = 'Sculpture')     OR
    (o.title = 'Mélodie Inachevée'   AND c.name = 'Musique')       OR
    (o.title = 'Urbanisme Poétique'  AND c.name = 'Photographie')  OR
    (o.title = 'Urbanisme Poétique'  AND c.name = 'Design');


INSERT IGNORE INTO comments (oeuvre_id, user_id, parent_comment_id, content)
SELECT o.oeuvre_id, u.user_id, NULL, c.content
FROM
    (SELECT 'alice' AS uname, 'Lumière d''Automne' AS title, 'Une photo absolument magnifique, les contrastes sont superbes !'  AS content) c
    JOIN users  u ON u.username = c.uname
    JOIN oeuvres o ON o.title   = c.title
UNION ALL
SELECT o.oeuvre_id, u.user_id, NULL, c.content
FROM
    (SELECT 'bob' AS uname, 'Le Cri Silencieux' AS title, 'Cette œuvre m''a touché profondément, bravo Alice.' AS content) c
    JOIN users  u ON u.username = c.uname
    JOIN oeuvres o ON o.title   = c.title
UNION ALL
SELECT o.oeuvre_id, u.user_id, NULL, c.content
FROM
    (SELECT 'charlie' AS uname, 'Urbanisme Poétique' AS title, 'Le regard sur la ville est très original.' AS content) c
    JOIN users  u ON u.username = c.uname
    JOIN oeuvres o ON o.title   = c.title;


INSERT IGNORE INTO votes (oeuvre_id, user_id, value)
SELECT o.oeuvre_id, u.user_id, v.value
FROM (
    SELECT 'alice',   'Fragments d''Acier',  1  UNION ALL
    SELECT 'alice',   'Lumière d''Automne',  1  UNION ALL
    SELECT 'bob',     'Le Cri Silencieux',   1  UNION ALL
    SELECT 'bob',     'Fragments d''Acier',  1  UNION ALL
    SELECT 'charlie', 'Le Cri Silencieux',   1  UNION ALL
    SELECT 'charlie', 'Lumière d''Automne',  1  UNION ALL
    SELECT 'charlie', 'Urbanisme Poétique',  1  UNION ALL
    SELECT 'admin',   'Mélodie Inachevée',  -1
) AS v(uname, title, value)
JOIN users   u ON u.username = v.uname
JOIN oeuvres o ON o.title    = v.title;
