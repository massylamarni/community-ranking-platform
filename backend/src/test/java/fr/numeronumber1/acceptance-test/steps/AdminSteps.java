package fr.numeronumber1.steps;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import io.cucumber.java.en.When;
import tools.jackson.databind.json.JsonMapper;

public class AdminSteps {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @Autowired
    private JsonMapper objectMapper;

    @When("l'administrateur crée une nouvelle œuvre")
    public void administrateur_cree_nouvelle_oeuvre() throws Exception {
        String title = "Œuvre administrateur " + UUID.randomUUID();
        var request = post("/works")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "title", title,
                        "description", "Description créée par un administrateur")));
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        MvcResult result = mockMvc.perform(request).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
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
