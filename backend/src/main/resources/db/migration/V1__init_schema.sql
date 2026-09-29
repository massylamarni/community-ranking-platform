
-- Flyway migration V1 – initial schema

CREATE TABLE users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    is_admin        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE categories (
    category_id     INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;


CREATE TABLE oeuvres (
    oeuvre_id       INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(150) NOT NULL,
    description     TEXT NULL,
    image_url       VARCHAR(255) NULL,
    author_id       INT NOT NULL,
    status          ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL,
    CONSTRAINT fk_oeuvre_author
        FOREIGN KEY (author_id) REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE oeuvre_categories (
    oeuvre_id       INT NOT NULL,
    category_id     INT NOT NULL,
    PRIMARY KEY (oeuvre_id, category_id),
    CONSTRAINT fk_oc_oeuvre
        FOREIGN KEY (oeuvre_id) REFERENCES oeuvres(oeuvre_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_oc_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE comments (
    comment_id          INT AUTO_INCREMENT PRIMARY KEY,
    oeuvre_id           INT NOT NULL,
    user_id             INT NOT NULL,
    parent_comment_id   INT NULL,
    content             TEXT NOT NULL,
    image_url           VARCHAR(255) NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_oeuvre
        FOREIGN KEY (oeuvre_id) REFERENCES oeuvres(oeuvre_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_comment_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_comment_parent
        FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE votes (
    vote_id         INT AUTO_INCREMENT PRIMARY KEY,
    oeuvre_id       INT NOT NULL,
    user_id         INT NOT NULL,
    value           TINYINT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vote_oeuvre
        FOREIGN KEY (oeuvre_id) REFERENCES oeuvres(oeuvre_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_vote_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_vote_oeuvre_user
        UNIQUE (oeuvre_id, user_id)
) ENGINE=InnoDB;

CREATE TABLE rankings (
    ranking_id      INT AUTO_INCREMENT PRIMARY KEY,
    category_id     INT NOT NULL,
    period_type     ENUM('week', 'month', 'year') NOT NULL,
    period_start    DATE NOT NULL,
    rank_position   TINYINT NOT NULL,
    oeuvre_id       INT NOT NULL,
    score           INT NOT NULL,
    CONSTRAINT fk_ranking_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ranking_oeuvre
        FOREIGN KEY (oeuvre_id) REFERENCES oeuvres(oeuvre_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;
