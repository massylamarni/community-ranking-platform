package fr.numeronumber1.steps;

import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;

public class AdminSteps {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @When("l'administrateur crée une nouvelle œuvre")
    public void administrateur_cree_nouvelle_oeuvre() {
        // TODO: implémenter la création administrative d'une œuvre
    }

    @When("l'administrateur supprime l'œuvre")
    public void administrateur_supprime_oeuvre() throws Exception {
        Long oeuvreId = scenarioContext.getOeuvreId();
        if (oeuvreId == null) {
            throw new AssertionError("Le scénario doit préparer l'œuvre à supprimer");
        }
        MvcResult result = mockMvc.perform(delete("/works/{id}", oeuvreId)
                        .session(scenarioContext.getSession()))
                .andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }
}
