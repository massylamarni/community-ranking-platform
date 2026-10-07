-- V5 – ajouter le score sur oeuvres pour le classement global
ALTER TABLE oeuvres ADD COLUMN score INT NOT NULL DEFAULT 0;
