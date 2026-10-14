package fr.numeronumber1.steps;

import java.util.Map;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

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

public class CategorySteps {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categories;

    @Autowired
    private OeuvreRepository oeuvres;

    @Autowired
    private OeuvreCategoryRepository oeuvreCategories;

    @Autowired
    private UserRepository users;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JsonMapper objectMapper;

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @Autowired
    private AuthSteps authSteps;

    @Given("aucune œuvre n'est associée à cette catégorie")
    public void aucune_oeuvre_associee_a_categorie() {
        Category category = categories.findById(scenarioContext.getCategoryId()).orElseThrow();
        assertTrue(category.getOeuvreCategories().isEmpty(),
                "La catégorie doit être vide avant sa suppression");
    }

    @Given("la catégorie {string} n'existe pas")
    public void categorie_n_existe_pas(String categoryName) {
        scenarioContext.setCategoryName(categoryName);
        assertTrue(categories.findByName(categoryName).isEmpty(),
                "La catégorie existe déjà: " + categoryName);
    }

    @When("l'administrateur crée la catégorie {string}")
    public void administrateur_cree_categorie(String categoryName) throws Exception {
        scenarioContext.setCategoryName(categoryName);
        envoyer_creation_categorie(categoryName);
    }

    @Then("la catégorie {string} est créée")
    public void categorie_est_creee(String categoryName) throws Exception {
        assertEquals(201, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode response = objectMapper.readTree(scenarioContext.getResponseBody());
        assertEquals(categoryName, response.path("name").asText());
        assertTrue(categories.existsByName(categoryName));
    }

    @Then("elle peut être utilisée pour déposer une œuvre")
    public void categorie_utilisable_pour_depot() {
        Category category = categories.findByName(scenarioContext.getCategoryName()).orElseThrow();
        assertTrue(category.getCategoryId() != null);
    }

    @When("l'administrateur supprime la catégorie {string}")
    public void administrateur_supprime_categorie(String categoryName) {
        assertEquals(categoryName, scenarioContext.getCategoryName());
    }

    @When("l'administrateur supprime la catégorie")
    public void administrateur_supprime_categorie_sans_nom() throws Exception {
        supprimerCategorieSelectionnee();
    }

    @When("il confirme la suppression")
    public void confirme_suppression_categorie() throws Exception {
        MvcResult result = mockMvc.perform(delete("/categories/{id}", scenarioContext.getCategoryId())
                .session(scenarioContext.getSession())).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    @When("il tente de supprimer la catégorie")
    public void utilisateur_tente_supprimer_categorie() throws Exception {
        MvcResult result = mockMvc.perform(delete("/categories/{id}", scenarioContext.getCategoryId())
                .session(scenarioContext.getSession())).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    @Then("la catégorie {string} n'existe plus")
    public void categorie_n_existe_plus(String categoryName) throws Exception {
        assertEquals(204, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertTrue(categories.findByName(categoryName).isEmpty(),
                "La catégorie supprimée est toujours en base: " + categoryName);
    }

    @Then("elle n'apparaît plus dans la liste des catégories")
    public void categorie_absente_de_liste() throws Exception {
        MvcResult result = mockMvc.perform(get("/categories")).andReturn();
        assertEquals(200, result.getResponse().getStatus(), result.getResponse().getContentAsString());
        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        for (JsonNode category : response) {
            assertFalse(category.path("name").asText().equals(scenarioContext.getCategoryName()),
                    result.getResponse().getContentAsString());
        }
    }

    @Then("elle ne peut plus être sélectionnée pour une nouvelle œuvre")
    public void categorie_indisponible_pour_nouvelle_oeuvre() throws Exception {
        MvcResult result = mockMvc.perform(get("/categories/{id}", scenarioContext.getCategoryId())).andReturn();
        assertEquals(404, result.getResponse().getStatus(), result.getResponse().getContentAsString());
        assertTrue(categories.findById(scenarioContext.getCategoryId()).isEmpty(),
                "La catégorie supprimée doit être indisponible");
    }

    @Then("la catégorie n'est pas supprimée")
    public void categorie_pas_supprimee() {
        assertEquals(403, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertTrue(categories.findById(scenarioContext.getCategoryId()).isPresent(),
                "La catégorie doit rester présente après une suppression refusée");
    }

    @When("il saisit le nom de catégorie {string}")
    public void saisit_nom_categorie(String categoryName) {
        scenarioContext.setCategoryName(categoryName);
    }

    @When("il valide la création")
    public void valide_creation_categorie() throws Exception {
        if (scenarioContext.getWorkTitle() != null || scenarioContext.getWorkDescription() != null) {
            authSteps.elle_valide_creation_oeuvre();
            return;
        }
        envoyer_creation_categorie(scenarioContext.getCategoryName());
    }

    @Then("elle apparaît dans la liste des catégories")
    public void categorie_apparait_dans_liste() throws Exception {
        MvcResult result = mockMvc.perform(get("/categories")).andReturn();
        assertEquals(200, result.getResponse().getStatus());
        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        boolean found = false;
        for (JsonNode category : response) {
            found |= category.path("name").asText().equals(scenarioContext.getCategoryName());
        }
        assertTrue(found, result.getResponse().getContentAsString());
    }

    @When("il tente de créer la catégorie {string}")
    public void tente_creer_categorie(String categoryName) throws Exception {
        scenarioContext.setCategoryName(categoryName);
        envoyer_creation_categorie(categoryName);
    }

    @Then("la catégorie n'est pas créée")
    public void categorie_n_est_pas_creee() {
        assertEquals(403, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertTrue(categories.findByName(scenarioContext.getCategoryName()).isEmpty());
    }

    private void envoyer_creation_categorie(String categoryName) throws Exception {
        MockHttpServletRequestBuilder request = post("/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("name", categoryName)));
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        MvcResult result = mockMvc.perform(request).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    private void supprimerCategorieSelectionnee() throws Exception {
        MvcResult result = mockMvc.perform(delete("/categories/{id}", scenarioContext.getCategoryId())
                .session(scenarioContext.getSession())).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    @When("un utilisateur consulte la catégorie {string}")
    public void utilisateur_consulte_categorie(String categoryName) throws Exception {
        Category category = categories.findByName(categoryName).orElseThrow();
        scenarioContext.setCategoryId(category.getCategoryId());
        MvcResult result = mockMvc.perform(get("/categories/{id}/works", category.getCategoryId())
                .param("page", "0")
                .param("size", "50")).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    @Given("les œuvres {string} et {string} appartiennent à cette catégorie")
    public void oeuvres_appartiennent_a_categorie(String firstTitle, String secondTitle) {
        Category category = categories.findById(scenarioContext.getCategoryId()).orElseThrow();
        creerOeuvrePubliee(firstTitle, category);
        creerOeuvrePubliee(secondTitle, category);
    }

    @Given("l'œuvre {string} appartient à la catégorie {string}")
    public void oeuvre_appartient_a_categorie(String title, String categoryName) {
        if (scenarioContext.getOeuvreId() != null) {
            Category category = categories.findByName(categoryName).orElseThrow();
            assertTrue(oeuvreCategories.existsById(
                    new OeuvreCategoryId(scenarioContext.getOeuvreId(), category.getCategoryId())));
            return;
        }
        Category category = categories.findByName(categoryName).orElseGet(() -> {
            Category created = new Category();
            created.setName(categoryName);
            return categories.save(created);
        });
        creerOeuvrePubliee(title, category);
    }

    @Then("{string} est affichée")
    public void oeuvre_est_affichee(String title) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode works = objectMapper.readTree(scenarioContext.getResponseBody()).path("content");
        boolean found = false;
        for (JsonNode work : works) {
            found |= work.path("title").asText().equals(title);
        }
        assertTrue(found, scenarioContext.getResponseBody());
    }

    @Then("{string} n'est pas affichée")
    public void oeuvre_n_est_pas_affichee(String title) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode works = objectMapper.readTree(scenarioContext.getResponseBody()).path("content");
        for (JsonNode work : works) {
            assertTrue(!work.path("title").asText().equals(title), scenarioContext.getResponseBody());
        }
    }

    @Given("aucune œuvre n'est associée à la catégorie {string}")
    public void aucune_oeuvre_associee_a_categorie(String categoryName) {
        Category category = categories.findByName(categoryName).orElseGet(() -> {
            Category created = new Category();
            created.setName(categoryName);
            return categories.save(created);
        });
        scenarioContext.setCategoryId(category.getCategoryId());
        scenarioContext.setCategoryName(category.getName());
    }

    @Then("aucune œuvre n'est affichée")
    public void aucune_oeuvre_n_est_affichee() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals(0, objectMapper.readTree(scenarioContext.getResponseBody()).path("content").size());
    }

    @Then("un message indique qu'aucune œuvre n'est disponible")
    public void message_aucune_oeuvre_disponible() {
        assertEquals(0, objectMapper.readTree(scenarioContext.getResponseBody()).path("content").size());
    }

    private void creerOeuvrePubliee(String title, Category category) {
        User author = users.findByUsername("cucumber-category-author").orElseGet(() -> {
            User created = new User();
            created.setUsername("cucumber-category-author");
            created.setEmail("cucumber-category-author@example.com");
            created.setPasswordHash(passwordEncoder.encode("fixture-password"));
            created.setAdmin(false);
            created.setCreatedAt(LocalDateTime.now());
            return users.save(created);
        });

        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setTitle(title);
        oeuvre.setDescription("Description de " + title);
        oeuvre.setAuthor(author);
        oeuvre.setStatus(OeuvreStatus.approved);
        Oeuvre saved = oeuvres.save(oeuvre);

        OeuvreCategory link = new OeuvreCategory();
        link.setId(new OeuvreCategoryId(saved.getOeuvreId(), category.getCategoryId()));
        link.setOeuvre(saved);
        link.setCategory(category);
        oeuvreCategories.save(link);
    }

    @When("elle crée l'œuvre {string}")
    public void elle_cree_oeuvre(String title) throws Exception {
        scenarioContext.setWorkTitle(title);
        scenarioContext.setWorkDescription("Description de " + title);
        MockHttpServletRequestBuilder request = post("/works")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                        "title", title,
                        "description", scenarioContext.getWorkDescription())));
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        MvcResult result = mockMvc.perform(request).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
        if (result.getResponse().getStatus() == 201) {
            scenarioContext.setOeuvreId(objectMapper.readTree(scenarioContext.getResponseBody())
                    .path("id").asLong());
        }
    }

    @When("elle renseigne {string} comme catégorie")
    public void elle_renseigne_categorie(String categoryName) {
        Category category = categories.findByName(categoryName).orElseThrow();
        scenarioContext.setCategoryId(category.getCategoryId());
        scenarioContext.setCategoryName(category.getName());
    }

    @When("elle publie l'œuvre")
    public void elle_publie_oeuvre() throws Exception {
        envoyer_soumission();
    }

    @Then("l'œuvre {string} est publiée")
    public void oeuvre_est_publiee(String title) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode response = objectMapper.readTree(scenarioContext.getResponseBody());
        assertEquals(title, response.path("title").asText());
        assertEquals("pending", response.path("status").asText());
    }

    @When("elle ne sélectionne aucune catégorie")
    public void elle_ne_selectionne_aucune_categorie() {
        scenarioContext.setCategoryId(null);
        scenarioContext.setCategoryName(null);
    }

    @When("elle tente de publier l'œuvre")
    public void elle_tente_publier_oeuvre() throws Exception {
        envoyer_soumission();
    }

    @Then("un message indique qu'une catégorie est obligatoire")
    public void message_categorie_obligatoire() {
        assertEquals(422, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertTrue(scenarioContext.getResponseBody().contains("categoryIds"),
                scenarioContext.getResponseBody());
        assertTrue(scenarioContext.getResponseBody().contains("Veuillez choisir au moins une catégorie"),
                scenarioContext.getResponseBody());
    }

    private void envoyer_soumission() throws Exception {
        List<Integer> categoryIds = scenarioContext.getCategoryId() == null
                ? List.of() : List.of(scenarioContext.getCategoryId());
        MockHttpServletRequestBuilder request = post("/works/{id}/submit", scenarioContext.getOeuvreId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("categoryIds", categoryIds)));
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        MvcResult result = mockMvc.perform(request).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    @Given("une catégorie existante")
    public void categorie_existante() {
        Category category = categories.findByName("Cucumber proposal category")
                .orElseGet(() -> {
                    Category created = new Category();
                    created.setName("Cucumber proposal category");
                    return categories.save(created);
                });
        scenarioContext.setCategoryId(category.getCategoryId());
        scenarioContext.setCategoryName(category.getName());
    }
}
