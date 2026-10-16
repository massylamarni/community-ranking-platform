package fr.numeronumber1.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fr.numeronumber1.dto.response.NotificationResponse;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.model.Notification;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.NotificationType;
import fr.numeronumber1.repository.NotificationRepository;
import fr.numeronumber1.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void create(String recipientUsername, NotificationType type, String message) {
        User recipient = userRepository.findByUsername(recipientUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + recipientUsername));

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setMessage(message);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listForUser(String username) {
        return notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(String username, Integer notificationId) {
        Notification notification = notificationRepository
                .findByNotificationIdAndRecipientUsername(notificationId, username)
                .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable : " + notificationId));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String username) {
        notificationRepository.markAllAsReadForUser(username);
    }
}
