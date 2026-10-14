ALTER TABLE votes
    MODIFY created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6);

CREATE TABLE vote_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vote_id INT NOT NULL,
    oeuvre_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    value TINYINT NULL,
    event_at TIMESTAMP(6) NOT NULL,
    INDEX idx_vote_history_vote_event (vote_id, event_at, history_id),
    INDEX idx_vote_history_oeuvre_event (oeuvre_id, event_at)
) ENGINE=InnoDB;

INSERT INTO vote_history (vote_id, oeuvre_id, user_id, value, event_at)
SELECT vote_id, oeuvre_id, user_id, value, created_at
FROM votes;
