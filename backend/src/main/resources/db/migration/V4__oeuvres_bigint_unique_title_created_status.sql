-- V4 – oeuvres : oeuvre_id en BIGINT, title unique, ajout du statut 'created'

ALTER TABLE oeuvre_categories DROP FOREIGN KEY fk_oc_oeuvre;
ALTER TABLE comments          DROP FOREIGN KEY fk_comment_oeuvre;
ALTER TABLE votes             DROP FOREIGN KEY fk_vote_oeuvre;
ALTER TABLE rankings          DROP FOREIGN KEY fk_ranking_oeuvre;

ALTER TABLE oeuvres           MODIFY oeuvre_id BIGINT AUTO_INCREMENT NOT NULL;
ALTER TABLE oeuvre_categories MODIFY oeuvre_id BIGINT NOT NULL;
ALTER TABLE comments          MODIFY oeuvre_id BIGINT NOT NULL;
ALTER TABLE votes             MODIFY oeuvre_id BIGINT NOT NULL;
ALTER TABLE rankings          MODIFY oeuvre_id BIGINT NOT NULL;

ALTER TABLE oeuvre_categories ADD CONSTRAINT fk_oc_oeuvre
    FOREIGN KEY (oeuvre_id) REFERENCES oeuvres(oeuvre_id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT fk_comment_oeuvre
    FOREIGN KEY (oeuvre_id) REFERENCES oeuvres(oeuvre_id) ON DELETE CASCADE;
ALTER TABLE votes ADD CONSTRAINT fk_vote_oeuvre
    FOREIGN KEY (oeuvre_id) REFERENCES oeuvres(oeuvre_id) ON DELETE CASCADE;
ALTER TABLE rankings ADD CONSTRAINT fk_ranking_oeuvre
    FOREIGN KEY (oeuvre_id) REFERENCES oeuvres(oeuvre_id) ON DELETE CASCADE;

ALTER TABLE oeuvres ADD CONSTRAINT uq_oeuvre_title UNIQUE (title);

ALTER TABLE oeuvres
    MODIFY status ENUM('created', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'created';
