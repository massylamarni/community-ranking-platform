package fr.numeronumber1.steps;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.OeuvreCategory;
import fr.numeronumber1.model.OeuvreCategoryId;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.CategoryRepository;
import fr.numeronumber1.repository.OeuvreCategoryRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.UserRepository;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

public class ModerationSteps {

    private static final String AUTHOR_USERNAME = "cucumber-moderation-author";
    private static final String RESUBMISSION_CATEGORY = "Cucumber resubmission";

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @Autowired
    private OeuvreRepository oeuvres;

    @Autowired
    private OeuvreCategoryRepository oeuvreCategories;

    @Autowired
    private CategoryRepository categories;

    @Autowired
    private UserRepository users;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper objectMapper;

    @Autowired
    private AuthSteps authSteps;

    @Given("l'œuvre {string} est en attente de modération")
    public void oeuvre_en_attente_moderation(String title) throws Exception {
        assertFalse(oeuvres.existsByTitle(title), "Une œuvre avec ce titre existe déjà: " + title);

        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setTitle(title);
        oeuvre.setDescription("Description de " + title);
        oeuvre.setAuthor(ensureAuthor());
        oeuvre.setStatus(OeuvreStatus.pending);
        Oeuvre saved = oeuvres.save(oeuvre);
        scenarioContext.setOeuvreId(saved.getOeuvreId());
        scenarioContext.setWorkTitle(saved.getTitle());
    }

    @Given("l'œuvre est en attente de modération")
    public void oeuvre_est_en_attente_moderation() {
        Oeuvre oeuvre = requireOeuvre();
        oeuvre.setStatus(OeuvreStatus.pending);
        oeuvres.save(oeuvre);
    }

    @Given("l'œuvre appartient à la catégorie {string}")
    public void oeuvre_appartient_a_categorie(String categoryName) {
        Category category = categories.findByName(categoryName).orElseGet(() -> {
            Category newCategory = new Category();
            newCategory.setName(categoryName);
            return categories.save(newCategory);
        });
        Oeuvre oeuvre = requireOeuvre();
        OeuvreCategory link = new OeuvreCategory();
        link.setId(new OeuvreCategoryId(oeuvre.getOeuvreId(), category.getCategoryId()));
        link.setOeuvre(oeuvre);
        link.setCategory(category);
        oeuvreCategories.save(link);

        List<OeuvreCategory> links = new ArrayList<>(oeuvre.getOeuvreCategories());
        links.add(link);
        oeuvre.setOeuvreCategories(links);
        scenarioContext.setCategoryId(category.getCategoryId());
        scenarioContext.setCategoryName(categoryName);
    }

    @When("l'administrateur accepte l'œuvre")
    @When("un administrateur accepte l'œuvre")
    public void administrateur_accepte_oeuvre() throws Exception {
        if (scenarioContext.getSession() == null || !scenarioContext.isAdministrator()) {
            authSteps.authenticateAs("cucumber-admin", true);
        }
        MvcResult result = mockMvc.perform(post("/moderation/works/{workId}/accept", requireOeuvreId())
                        .session(scenarioContext.getSession()))
                .andReturn();
        capture(result);
    }

    @Then("l'œuvre est publiée")
    public void oeuvre_est_publiee() throws Exception {
        Oeuvre oeuvre = requireOeuvre();
        assertEquals(OeuvreStatus.approved, oeuvre.getStatus());
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
    }

    @Then("son statut est {string}")
    public void statut_oeuvre_est(String status) {
        assertEquals(expectedStatus(status), requireOeuvre().getStatus().name());
    }

    @When("l'administrateur refuse l'œuvre")
    @When("un administrateur refuse l'œuvre")
    public void administrateur_refuse_oeuvre() throws Exception {
        var request = post("/moderation/works/{workId}/refuse", requireOeuvreId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("reason", "Refusé dans le test")));
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        capture(mockMvc.perform(request).andReturn());
    }

    @Then("le statut de {string} devient {string}")
    public void statut_oeuvre_devient(String title, String status) {
        Oeuvre oeuvre = requireOeuvre();
        assertEquals(title, oeuvre.getTitle());
        assertEquals(expectedStatus(status), oeuvre.getStatus().name());
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
    }

    @Then("{string} apparaît dans la liste des œuvres de la catégorie {string}")
    public void oeuvre_apparait_dans_liste_categorie(String title, String categoryName) throws Exception {
        assertEquals(categoryName, scenarioContext.getCategoryName());
        assertNotNull(scenarioContext.getCategoryId(), "La catégorie de l'œuvre doit avoir été préparée");
        MvcResult result = mockMvc.perform(get("/categories/{categoryId}/works", scenarioContext.getCategoryId()))
                .andReturn();
        assertEquals(200, result.getResponse().getStatus(), result.getResponse().getContentAsString());
        JsonNode content = objectMapper.readTree(result.getResponse().getContentAsString()).path("content");
        assertTrue(containsTitle(content, title), result.getResponse().getContentAsString());
    }

    @Then("l'œuvre peut être consultée par les utilisateurs")
    public void oeuvre_consultable_par_utilisateurs() throws Exception {
        MvcResult result = mockMvc.perform(get("/works/{workId}", requireOeuvreId())).andReturn();
        assertEquals(200, result.getResponse().getStatus(), result.getResponse().getContentAsString());
        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        assertEquals(scenarioContext.getWorkTitle(), response.path("title").asString());
        assertEquals(OeuvreStatus.approved.name(), response.path("status").asString());
    }

    @Then("{string} n'apparaît pas dans les œuvres publiques")
    public void oeuvre_absente_des_oeuvres_publiques(String title) throws Exception {
        MvcResult result = mockMvc.perform(get("/works").param("status", OeuvreStatus.approved.name())).andReturn();
        assertEquals(200, result.getResponse().getStatus(), result.getResponse().getContentAsString());
        assertFalse(containsTitle(objectMapper.readTree(result.getResponse().getContentAsString()), title),
                result.getResponse().getContentAsString());
    }

    @Then("l'auteur de {string} est informé du refus")
    public void auteur_informe_du_refus(String title) throws Exception {
        authSteps.authenticateAs(AUTHOR_USERNAME, false);
        MvcResult result = mockMvc.perform(get("/notifications").session(scenarioContext.getSession())).andReturn();
        assertEquals(200, result.getResponse().getStatus(), result.getResponse().getContentAsString());

        JsonNode notifications = objectMapper.readTree(result.getResponse().getContentAsString());
        boolean hasRefusalNotification = false;
        for (JsonNode notification : notifications) {
            if ("MODERATION".equals(notification.path("type").asString())
                    && notification.path("message").asString().contains(title)
                    && notification.path("message").asString().contains("refusée")) {
                hasRefusalNotification = true;
                break;
            }
        }
        assertTrue(hasRefusalNotification, result.getResponse().getContentAsString());
    }

    @Given("l'utilisateur a proposé l'œuvre {string}")
    public void utilisateur_a_propose_oeuvre(String title) throws Exception {
        authSteps.authenticateAs(AUTHOR_USERNAME, false);
        assertFalse(oeuvres.existsByTitle(title), "Une œuvre avec ce titre existe déjà: " + title);

        Category category = categories.findByName(RESUBMISSION_CATEGORY).orElseGet(() -> {
            Category newCategory = new Category();
            newCategory.setName(RESUBMISSION_CATEGORY);
            return categories.save(newCategory);
        });

        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setTitle(title);
        oeuvre.setDescription("Description originale");
        oeuvre.setAuthor(author());
        oeuvre.setStatus(OeuvreStatus.pending);
        Oeuvre saved = oeuvres.save(oeuvre);
        scenarioContext.setOeuvreId(saved.getOeuvreId());
        scenarioContext.setWorkTitle(saved.getTitle());
        scenarioContext.setCategoryId(category.getCategoryId());
        attachCategory(saved, category);
    }

    @Given("la proposition a été refusée")
    public void proposition_a_ete_refusee() {
        Oeuvre oeuvre = requireOeuvre();
        assertEquals(OeuvreStatus.pending, oeuvre.getStatus());
        oeuvre.setStatus(OeuvreStatus.rejected);
        oeuvre.setRejectionReason("Description insuffisante");
        oeuvres.save(oeuvre);
    }

    @When("utilisateur modifie la description de l'œuvre")
    public void utilisateur_modifie_description_oeuvre() {
        assertEquals(OeuvreStatus.rejected, requireOeuvre().getStatus());
        assertEquals(AUTHOR_USERNAME, scenarioContext.getUsername());
    }

    @When("il remplace la description par {string}")
    public void remplace_description_oeuvre(String description) throws Exception {
        scenarioContext.setWorkDescription(description);
        var request = patch("/works/{workId}", requireOeuvreId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("description", description)))
                .session(scenarioContext.getSession());
        MvcResult result = mockMvc.perform(request).andReturn();
        assertEquals(200, result.getResponse().getStatus(), result.getResponse().getContentAsString());
    }

    @When("il soumet à nouveau l'œuvre")
    public void soumet_oeuvre_a_nouveau() throws Exception {
        List<Integer> categoryIds = requireOeuvre().getOeuvreCategories().stream()
                .map(link -> link.getCategory().getCategoryId())
                .toList();
        var request = post("/works/{workId}/submit", requireOeuvreId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("categoryIds", categoryIds)))
                .session(scenarioContext.getSession());
        capture(mockMvc.perform(request).andReturn());
    }

    @Then("la nouvelle proposition est enregistrée")
    public void nouvelle_proposition_enregistree() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode response = objectMapper.readTree(scenarioContext.getResponseBody());
        assertEquals(scenarioContext.getWorkDescription(), response.path("description").asString());
        assertEquals(scenarioContext.getWorkDescription(), requireOeuvre().getDescription());
    }

    @Then("la proposition est envoyée au filtrage automatique")
    public void proposition_envoyee_au_filtrage() {
        assertEquals(OeuvreStatus.pending, requireOeuvre().getStatus());
    }

    private User author() {
        return users.findByUsername(AUTHOR_USERNAME)
                .orElseThrow(() -> new AssertionError("Le compte auteur de préparation est introuvable"));
    }

    private User ensureAuthor() {
        return users.findByUsername(AUTHOR_USERNAME).orElseGet(() -> {
            User author = new User();
            author.setUsername(AUTHOR_USERNAME);
            author.setEmail(AUTHOR_USERNAME + "@example.com");
            author.setPasswordHash(passwordEncoder.encode("fixture-password"));
            author.setAdmin(false);
            author.setCreatedAt(java.time.LocalDateTime.now());
            return users.save(author);
        });
    }

    private Oeuvre requireOeuvre() {
        return oeuvres.findById(requireOeuvreId())
                .orElseThrow(() -> new AssertionError("L'œuvre de préparation est introuvable"));
    }

    private Long requireOeuvreId() {
        Long oeuvreId = scenarioContext.getOeuvreId();
        assertNotNull(oeuvreId, "Le scénario doit préparer une œuvre");
        return oeuvreId;
    }

    private void attachCategory(Oeuvre oeuvre, Category category) {
        OeuvreCategory link = new OeuvreCategory();
        link.setId(new OeuvreCategoryId(oeuvre.getOeuvreId(), category.getCategoryId()));
        link.setOeuvre(oeuvre);
        link.setCategory(category);
        oeuvreCategories.save(link);
        oeuvre.getOeuvreCategories().add(link);
    }

    private void capture(MvcResult result) throws Exception {
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    private String expectedStatus(String status) {
        return switch (status) {
            case "Acceptée" -> OeuvreStatus.approved.name();
            case "Refusée" -> OeuvreStatus.rejected.name();
            case "En attente de modération" -> OeuvreStatus.pending.name();
            default -> status;
        };
    }

    private boolean containsTitle(JsonNode works, String title) {
        for (JsonNode work : works) {
            if (title.equals(work.path("title").asString())) {
                return true;
            }
        }
        return false;
    }
}
