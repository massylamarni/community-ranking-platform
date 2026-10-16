CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT          NOT NULL,
    type            VARCHAR(50)  NOT NULL,
    message         TEXT         NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE,
    INDEX idx_notifications_user_created_at (user_id, created_at)
) ENGINE=InnoDB;
