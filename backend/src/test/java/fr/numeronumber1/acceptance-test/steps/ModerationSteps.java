package fr.numeronumber1.steps;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.UserRepository;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import tools.jackson.databind.json.JsonMapper;

public class ModerationSteps {

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @Autowired
    private OeuvreRepository oeuvres;

    @Autowired
    private UserRepository users;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper objectMapper;

    @Given("l'œuvre {string} est en attente de modération")
    public void oeuvre_en_attente_moderation(String title) {
        User author = users.findByUsername(scenarioContext.getUsername()).orElse(null);
        if (author == null) {
            return;
        }
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setTitle(title);
        oeuvre.setDescription("Description de " + title);
        oeuvre.setAuthor(author);
        oeuvre.setStatus(OeuvreStatus.pending);
        Oeuvre saved = oeuvres.save(oeuvre);
        scenarioContext.setOeuvreId(saved.getOeuvreId());
        scenarioContext.setWorkTitle(saved.getTitle());
    }

    @Given("l'œuvre est en attente de modération")
    public void oeuvre_est_en_attente_moderation() {
        // TODO: préparer une œuvre en attente de modération
    }

    @Given("l'œuvre appartient à la catégorie {string}")
    public void oeuvre_appartient_a_categorie(String categoryName) {
        // TODO: préparer la catégorie de l'œuvre
    }

    @When("l'administrateur accepte l'œuvre")
    @When("un administrateur accepte l'œuvre")
    public void administrateur_accepte_oeuvre() throws Exception {
        if (scenarioContext.getOeuvreId() == null) {
            return;
        }
        var request = post("/moderation/works/{workId}/accept", scenarioContext.getOeuvreId());
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        MvcResult result = mockMvc.perform(request).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    @Then("l'œuvre est publiée")
    public void oeuvre_est_publiee() {
        // TODO: vérifier la publication après modération
    }

    @Then("son statut est {string}")
    public void statut_oeuvre_est(String status) {
        if (scenarioContext.getOeuvreId() == null) {
            return;
        }
        String expected = switch (status) {
            case "Acceptée" -> OeuvreStatus.approved.name();
            case "Refusée" -> OeuvreStatus.rejected.name();
            default -> status;
        };
        assertEquals(expected, oeuvres.findById(scenarioContext.getOeuvreId())
                .orElseThrow().getStatus().name());
    }

    @When("l'administrateur refuse l'œuvre")
    @When("un administrateur refuse l'œuvre")
    public void administrateur_refuse_oeuvre() throws Exception {
        if (scenarioContext.getOeuvreId() == null) {
            return;
        }
        var request = post("/moderation/works/{workId}/refuse", scenarioContext.getOeuvreId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("reason", "Refusé dans le test")));
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        MvcResult result = mockMvc.perform(request).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    @Then("le statut de {string} devient {string}")
    public void statut_oeuvre_devient(String title, String status) {
        // TODO: vérifier le changement de statut
    }

    @Then("{string} apparaît dans la liste des œuvres de la catégorie {string}")
    public void oeuvre_apparait_dans_liste_categorie(String title, String categoryName) {
        // TODO: vérifier la présence de l'œuvre dans la catégorie
    }

    @Then("l'œuvre peut être consultée par les utilisateurs")
    public void oeuvre_consultable_par_utilisateurs() {
        // TODO: vérifier que l'œuvre peut être consultée
    }

    @Then("{string} n'apparaît pas dans les œuvres publiques")
    public void oeuvre_absente_des_oeuvres_publiques(String title) {
        // TODO: vérifier que l'œuvre n'est pas visible publiquement
    }

    @Then("l'auteur de {string} est informé du refus")
    public void auteur_informe_du_refus(String title) {
        // TODO: vérifier l'information de l'auteur
    }

    @Given("l'utilisateur a proposé l'œuvre {string}")
    public void utilisateur_a_propose_oeuvre(String title) {
        // TODO: préparer une œuvre proposée
    }

    @Given("la proposition a été refusée")
    public void proposition_a_ete_refusee() {
        // TODO: préparer une proposition refusée
    }

    @When("utilisateur modifie la description de l'œuvre")
    public void utilisateur_modifie_description_oeuvre() {
        // TODO: préparer la modification de description
    }

    @When("il remplace la description par {string}")
    public void remplace_description_oeuvre(String description) {
        // TODO: préparer la nouvelle description
    }

    @When("il soumet à nouveau l'œuvre")
    public void soumet_oeuvre_a_nouveau() {
        // TODO: préparer une nouvelle soumission
    }

    @Then("la nouvelle proposition est enregistrée")
    public void nouvelle_proposition_enregistree() {
        // TODO: vérifier l'enregistrement de la proposition
    }

    @Then("la proposition est envoyée au filtrage automatique")
    public void proposition_envoyee_au_filtrage() {
        // TODO: vérifier l'envoi au filtrage automatique
    }
}
