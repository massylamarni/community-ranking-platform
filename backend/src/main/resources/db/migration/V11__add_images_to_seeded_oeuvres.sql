UPDATE oeuvres
SET image_url = CASE title
    WHEN 'Le Cri Silencieux' THEN '/uploads/works/le-cri-silencieux.jpg'
    WHEN 'Lumière d''Automne' THEN '/uploads/works/lumiere-d-automne.jpg'
    WHEN 'Fragments d''Acier' THEN '/uploads/works/fragments-d-acier.jpg'
    WHEN 'Mélodie Inachevée' THEN '/uploads/works/melodie-inachevee.jpg'
    WHEN 'Urbanisme Poétique' THEN '/uploads/works/urbanisme-poetique.jpg'
    WHEN 'Éclats de lumière' THEN '/uploads/works/eclats-de-lumiere.jpg'
    WHEN 'Jardin de silence' THEN '/uploads/works/jardin-de-silence.jpg'
    WHEN 'Matière vivante' THEN '/uploads/works/matiere-vivante.jpg'
    WHEN 'Ville en mouvement' THEN '/uploads/works/ville-en-mouvement.jpg'
END
WHERE title IN (
    'Le Cri Silencieux',
    'Lumière d''Automne',
    'Fragments d''Acier',
    'Mélodie Inachevée',
    'Urbanisme Poétique',
    'Éclats de lumière',
    'Jardin de silence',
    'Matière vivante',
    'Ville en mouvement'
)
AND (image_url IS NULL OR image_url = '');
