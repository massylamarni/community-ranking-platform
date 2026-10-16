package fr.numeronumber1.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import fr.numeronumber1.dto.response.NotificationResponse;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.model.Notification;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.NotificationType;
import fr.numeronumber1.repository.NotificationRepository;
import fr.numeronumber1.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void shouldCreateNotification() {
        User recipient = new User();
        recipient.setUsername("alice");

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(recipient));

        notificationService.create("alice", NotificationType.MODERATION, "Votre œuvre a été acceptée.");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals(recipient, saved.getRecipient());
        assertEquals(NotificationType.MODERATION, saved.getType());
        assertEquals("Votre œuvre a été acceptée.", saved.getMessage());
        assertFalse(saved.isRead());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void shouldThrowExceptionWhenUserNotFoundOnCreate() {
        when(userRepository.findByUsername("inconnu")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                notificationService.create("inconnu", NotificationType.MODERATION, "Message")
        );

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void shouldListNotificationsForUser() {
        User recipient = new User();
        recipient.setUsername("alice");

        Notification n1 = new Notification();
        n1.setNotificationId(1);
        n1.setRecipient(recipient);
        n1.setType(NotificationType.MODERATION);
        n1.setMessage("Message 1");
        n1.setCreatedAt(LocalDateTime.now());
        n1.setRead(false);

        when(notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc("alice"))
                .thenReturn(List.of(n1));

        List<NotificationResponse> result = notificationService.listForUser("alice");

        assertEquals(1, result.size());
        assertEquals("Message 1", result.get(0).getMessage());
    }

    @Test
    void shouldMarkNotificationAsRead() {
        Notification notification = new Notification();
        notification.setNotificationId(10);
        notification.setRead(false);

        when(notificationRepository.findByNotificationIdAndRecipientUsername(10, "alice"))
                .thenReturn(Optional.of(notification));

        notificationService.markAsRead("alice", 10);

        assertTrue(notification.isRead());
        verify(notificationRepository).save(notification);
    }

    @Test
    void shouldMarkAllNotificationsAsRead() {
        notificationService.markAllAsRead("alice");

        verify(notificationRepository).markAllAsReadForUser("alice");
    }
}
