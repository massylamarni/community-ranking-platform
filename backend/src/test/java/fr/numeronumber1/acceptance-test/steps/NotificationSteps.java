package fr.numeronumber1.steps;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import fr.numeronumber1.model.Notification;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.NotificationType;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.NotificationRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.UserRepository;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class NotificationSteps {

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @Autowired
    private UserRepository users;

    @Autowired
    private OeuvreRepository oeuvres;

    @Autowired
    private NotificationRepository notifications;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Given("un utilisateur a soumis une œuvre")
    public void utilisateur_a_soumis_oeuvre() {
        String username = scenarioContext.getUsername();
        User author = null;
        if (username != null) {
            author = users.findByUsername(username).orElse(null);
        }
        if (author == null) {
            String authorUsername = "auteur_" + UUID.randomUUID().toString().substring(0, 8);
            author = new User();
            author.setUsername(authorUsername);
            author.setEmail(authorUsername + "@example.com");
            author.setPasswordHash(passwordEncoder.encode("Password123!"));
            author.setAdmin(false);
            author.setCreatedAt(LocalDateTime.now());
            author = users.save(author);
            scenarioContext.setUsername(authorUsername);
        }

        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setTitle("Œuvre " + UUID.randomUUID().toString().substring(0, 8));
        oeuvre.setDescription("Description de l'œuvre");
        oeuvre.setAuthor(author);
        oeuvre.setStatus(OeuvreStatus.pending);
        Oeuvre saved = oeuvres.save(oeuvre);

        scenarioContext.setOeuvreId(saved.getOeuvreId());
        scenarioContext.setWorkTitle(saved.getTitle());
    }

    @Then("l'utilisateur est informé que son œuvre a été acceptée")
    public void utilisateur_informe_acceptation_oeuvre() {
        Long oeuvreId = scenarioContext.getOeuvreId();
        assertNotNull(oeuvreId, "L'identifiant de l'œuvre doit être présent");

        Oeuvre oeuvre = oeuvres.findById(oeuvreId).orElseThrow();
        String authorUsername = oeuvre.getAuthor().getUsername();

        List<Notification> userNotifications = notifications
                .findByRecipientUsernameOrderByCreatedAtDesc(authorUsername);

        assertFalse(userNotifications.isEmpty(), "L'utilisateur devrait avoir reçu une notification");

        Notification notif = userNotifications.get(0);
        assertEquals(NotificationType.MODERATION, notif.getType());
        assertTrue(notif.getMessage().contains("acceptée"),
                "Le message doit indiquer que l'œuvre a été acceptée : " + notif.getMessage());
        assertTrue(notif.getMessage().contains(oeuvre.getTitle()),
                "Le message doit contenir le titre de l'œuvre : " + notif.getMessage());
    }

    @Then("l'utilisateur est informé que son œuvre a été refusée")
    public void utilisateur_informe_refus_oeuvre() {
            Long oeuvreId = scenarioContext.getOeuvreId();
    assertNotNull(oeuvreId, "L'identifiant de l'œuvre doit être présent");

    Oeuvre oeuvre = oeuvres.findById(oeuvreId).orElseThrow();
    String authorUsername = oeuvre.getAuthor().getUsername();

    List<Notification> userNotifications = notifications
            .findByRecipientUsernameOrderByCreatedAtDesc(authorUsername);

    assertFalse(userNotifications.isEmpty(), "L'utilisateur devrait avoir reçu une notification");

    Notification notif = userNotifications.get(0);
    assertEquals(NotificationType.MODERATION, notif.getType());
    assertTrue(notif.getMessage().contains("refusée"),
            "Le message doit indiquer que l'œuvre a été refusée : " + notif.getMessage());

    assertTrue(notif.getMessage().contains(oeuvre.getTitle()),
            "Le message doit contenir le titre de l'œuvre : " + notif.getMessage());        
    }
}
