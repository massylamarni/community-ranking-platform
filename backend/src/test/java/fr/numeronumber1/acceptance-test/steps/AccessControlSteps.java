package fr.numeronumber1.steps;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.beans.factory.annotation.Autowired;

import fr.numeronumber1.model.Comment;
import fr.numeronumber1.repository.CommentRepository;
import io.cucumber.java.en.Then;

public class AccessControlSteps {

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @Autowired
    private CommentRepository comments;

    @Then("un message indique qu'il n'a pas les droits nécessaires")
    public void message_droits_insuffisants() {
        assertEquals(403, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        String responseBody = scenarioContext.getResponseBody();
        assertTrue(responseBody.contains("Droits insuffisants")
                        || responseBody.contains("pas autorisé")
                        || responseBody.contains("réservée"),
                responseBody);
        if (scenarioContext.getCommentId() != null) {
            Comment comment = comments.findById(scenarioContext.getCommentId())
                    .orElseThrow(() -> new AssertionError(
                            "Le commentaire doit toujours exister après le refus"));
            assertNotNull(scenarioContext.getCommentContent());
            assertEquals(scenarioContext.getCommentContent(), comment.getContent(),
                    "Le refus ne doit pas modifier le contenu du commentaire");
        }
    }
}
