package fr.numeronumber1.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import fr.numeronumber1.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByRecipientUsernameOrderByCreatedAtDesc(String username);

    Optional<Notification> findByNotificationIdAndRecipientUsername(Integer notificationId, String username);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient.username = :username AND n.read = false")
    void markAllAsReadForUser(String username);
}
