package fr.numeronumber1.steps;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.beans.factory.annotation.Autowired;

import io.cucumber.java.en.Then;

public class AccessControlSteps {

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @Then("un message indique qu'il n'a pas les droits nécessaires")
    public void message_droits_insuffisants() {
        assertEquals(403, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertTrue(scenarioContext.getResponseBody().contains("Droits insuffisants"),
                scenarioContext.getResponseBody());
    }
}
