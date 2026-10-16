package fr.numeronumber1.dto.response;

import java.time.LocalDateTime;

import fr.numeronumber1.model.Notification;
import fr.numeronumber1.model.enums.NotificationType;

public class NotificationResponse {

    private Integer id;
    private NotificationType type;
    private String message;
    private LocalDateTime createdAt;
    private boolean read;

    public NotificationResponse(Notification n) {
        this.id = n.getNotificationId();
        this.type = n.getType();
        this.message = n.getMessage();
        this.createdAt = n.getCreatedAt();
        this.read = n.isRead();
    }

    public Integer getId() { return id; }
    public NotificationType getType() { return type; }
    public String getMessage() { return message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isRead() { return read; }
}
