package fr.numeronumber1.steps;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Comment;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.OeuvreCategory;
import fr.numeronumber1.model.OeuvreCategoryId;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.CategoryRepository;
import fr.numeronumber1.repository.CommentRepository;
import fr.numeronumber1.repository.OeuvreCategoryRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.UserRepository;
import fr.numeronumber1.repository.VoteRepository;
import io.cucumber.java.After;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

public class OeuvreSteps {

    @Autowired private MockMvc mockMvc;
    @Autowired private JsonMapper objectMapper;
    @Autowired private OeuvreRepository oeuvres;
    @Autowired private UserRepository users;
    @Autowired private CategoryRepository categories;
    @Autowired private OeuvreCategoryRepository oeuvreCategories;
    @Autowired private VoteRepository votes;
    @Autowired private CommentRepository comments;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AcceptanceScenarioContext scenarioContext;
    @Autowired private AuthSteps authSteps;

    @Value("${app.upload.dir:uploads}")
    private String uploadDirectory;

    private String editedTitle;
    private String editedDescription;
    private boolean updatePrepared;
    private boolean expectCommentList;
    private boolean descriptionWasOmitted;
    private int expectedVoteCount;

    @Given("une œuvre existe")
    public void oeuvre_existe() {
        saveWork(scenarioAuthor(), uniqueTitle("œuvre existante"), "Description initiale", OeuvreStatus.created);
    }

    @Given("une œuvre existante")
    public void oeuvre_existante() {
        User author = scenarioContext.isAdministrator()
                ? fixtureUser("cucumber-work-owner", false) : scenarioAuthor();
        saveWork(author, uniqueTitle("œuvre existante"), "Description initiale", OeuvreStatus.created);
    }

    @Then("l'œuvre est créée")
    public void oeuvre_est_creee() throws Exception {
        assertTrue(scenarioContext.getResponseStatus() == 201 || scenarioContext.getResponseStatus() == 200,
            scenarioContext.getResponseBody());
        JsonNode body = lastResponse();
        assertTrue(body.path("id").canConvertToLong(), scenarioContext.getResponseBody());
        List<String> expectedStatuses = scenarioContext.isAdministrator()
            ? List.of("created", "pending", "approved")
            : List.of("created", "pending");
        assertTrue(expectedStatuses.contains(body.path("status").asText()),
                scenarioContext.getResponseBody());
    }

    @Then("l'œuvre est supprimée")
    public void oeuvre_est_supprimee() {
        assertEquals(204, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertFalse(oeuvres.existsById(requireOeuvreId()));
    }

    @Then("l'œuvre n'est pas publiée")
    public void oeuvre_n_est_pas_publiee() throws Exception {
        OeuvreStatus status = oeuvres.findById(requireOeuvreId()).orElseThrow().getStatus();
        if (scenarioContext.getResponseStatus() == 422) {
            assertEquals(OeuvreStatus.created, status, scenarioContext.getResponseBody());
            return;
        }
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals(OeuvreStatus.rejected, status, scenarioContext.getResponseBody());
    }

    @Then("l'œuvre est créée avec le titre {string}")
    public void oeuvre_creee_avec_titre(String title) throws Exception {
        assertEquals(201, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode body = lastResponse();
        assertEquals(title, body.path("title").asText());
        assertEquals("created", body.path("status").asText());
        scenarioContext.setOeuvreId(body.path("id").asLong());
    }

    @When("elle ne saisit aucun titre")
    public void elle_ne_saisit_aucun_titre() {
        scenarioContext.setWorkTitle(null);
        descriptionWasOmitted = false;
    }

    @When("elle renseigne les autres informations obligatoires")
    public void elle_renseigne_autres_informations_obligatoires() {
        if (!descriptionWasOmitted && scenarioContext.getWorkDescription() == null) {
            scenarioContext.setWorkDescription("Description de validation");
        }
    }

    @Then("un message indique que le titre est obligatoire")
    public void message_titre_obligatoire() throws Exception {
        assertValidationMessage("title", "Le titre est obligatoire");
    }

    @Then("sa description est {string}")
    public void description_oeuvre_est(String description) throws Exception {
        assertEquals(201, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals(description, lastResponse().path("description").asText());
    }

    @When("elle ne saisit aucune description")
    public void elle_ne_saisit_aucune_description() {
        scenarioContext.setWorkDescription(null);
        descriptionWasOmitted = true;
    }

    @Then("un message indique que la description est obligatoire")
    public void message_description_obligatoire() throws Exception {
        assertValidationMessage("description", "La description est obligatoire");
    }

    @Given("les informations obligatoires de l'œuvre sont renseignées")
    public void informations_obligatoires_renseignees() {
        scenarioContext.setWorkTitle(uniqueTitle("œuvre avec image"));
        scenarioContext.setWorkDescription("Description de l'œuvre de test");
        scenarioContext.setImageFileName(null);
    }

    @When("il associe l'image {string} à l'œuvre")
    public void associe_image_a_oeuvre(String imageName) {
        scenarioContext.setImageFileName(imageName);
    }

    @When("il ne sélectionne aucune image")
    public void ne_selectionne_aucune_image() {
        scenarioContext.setImageFileName(null);
    }

    @Then("l'image {string} est associée à l'œuvre")
    public void image_est_associee_a_oeuvre(String imageName) throws Exception {
        assertEquals(201, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        String imageUrl = lastResponse().path("imageUrl").asText();
        assertTrue(imageUrl.startsWith("/uploads/works/"), imageUrl);
        assertTrue(imageUrl.endsWith(".jpg") || imageUrl.endsWith(".jpeg"), imageUrl);
        scenarioContext.setImageUrl(imageUrl);
    }

    @Then("aucune image n'est associée à l'œuvre")
    public void aucune_image_associee_a_oeuvre() throws Exception {
        assertEquals(201, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertTrue(lastResponse().path("imageUrl").isNull(), scenarioContext.getResponseBody());
    }

    @Given("une proposition de cet utilisateur qui a été refusée")
    public void proposition_utilisateur_refusee() {
        User author = scenarioAuthor();
        Category category = ensureCategory("Cucumber propositions");
        saveWork(author, uniqueTitle("proposition refusée"), "Description refusée", OeuvreStatus.rejected);
        scenarioContext.setCategoryId(category.getCategoryId());
        scenarioContext.setCategoryName(category.getName());
    }

    @When("l'utilisateur propose une œuvre dans cette catégorie")
    public void utilisateur_propose_oeuvre_dans_categorie() throws Exception {
        Category category = scenarioContext.getCategoryId() == null
                ? ensureCategory("Cucumber proposal category")
                : categories.findById(scenarioContext.getCategoryId()).orElseThrow();
        scenarioContext.setCategoryId(category.getCategoryId());
        scenarioContext.setCategoryName(category.getName());
        String title = uniqueTitle("proposition");
        perform(post("/works")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("title", title,
                        "description", "Description de proposition"))));
        if (scenarioContext.getResponseStatus() == 201) {
            Long id = lastResponse().path("id").asLong();
            scenarioContext.setOeuvreId(id);
            perform(post("/works/{id}/submit", id)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of("categoryIds", List.of(category.getCategoryId())))));
        }
    }

    @When("l'utilisateur tente de proposer une œuvre")
    public void utilisateur_tente_de_proposer_oeuvre() throws Exception {
        perform(post("/works")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("title", uniqueTitle("proposition anonyme"),
                        "description", "Description de proposition"))));
    }

    @Then("la proposition de l'œuvre est enregistrée")
    public void proposition_oeuvre_enregistree() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals("pending", lastResponse().path("status").asText());
        assertTrue(lastResponse().path("id").canConvertToLong());
    }

    @Then("l'œuvre est associée à la catégorie sélectionnée")
    public void oeuvre_associee_a_categorie_selectionnee() throws Exception {
        assertNotNull(scenarioContext.getCategoryId());
        assertTrue(oeuvreCategories.existsById(
                new OeuvreCategoryId(requireOeuvreId(), scenarioContext.getCategoryId())),
                scenarioContext.getResponseBody());
    }

    @Then("la proposition de l'œuvre est refusée")
    public void proposition_oeuvre_refusee() {
        assertEquals(401, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
    }

    @When("l'utilisateur modifie la proposition")
    public void utilisateur_modifie_proposition() throws Exception {
        editedDescription = "Description modifiée";
        perform(patch("/works/{id}", requireOeuvreId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("description", editedDescription))));
    }

    @Then("la proposition est modifiée")
    public void proposition_est_modifiee() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals("created", lastResponse().path("status").asText());
        assertEquals(editedDescription, lastResponse().path("description").asText());
    }

    @When("l'utilisateur soumet à nouveau la proposition")
    public void utilisateur_soumet_proposition_a_nouveau() throws Exception {
        Integer categoryId = scenarioContext.getCategoryId();
        assertNotNull(categoryId, "La proposition doit avoir une catégorie de test");
        perform(post("/works/{id}/submit", requireOeuvreId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("categoryIds", List.of(categoryId)))));
    }

    @Then("la proposition est soumise à nouveau")
    public void proposition_est_soumise_a_nouveau() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals("pending", lastResponse().path("status").asText());
    }

    @Given("une œuvre créée par cet utilisateur")
    public void oeuvre_creee_par_utilisateur() {
        saveWork(scenarioAuthor(), uniqueTitle("œuvre personnelle"), "Description initiale",
                OeuvreStatus.created);
    }

    @Given("une œuvre créée par un autre utilisateur")
    public void oeuvre_creee_par_autre_utilisateur() {
        saveWork(fixtureUser("cucumber-other-owner", false), uniqueTitle("œuvre tierce"),
                "Description initiale", OeuvreStatus.created);
    }

    @When("l'utilisateur modifie l'œuvre")
    public void utilisateur_modifie_oeuvre() throws Exception {
        editedTitle = uniqueTitle("œuvre modifiée");
        editedDescription = "Description modifiée par l'auteur";
        perform(patch("/works/{id}", requireOeuvreId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("title", editedTitle,
                        "description", editedDescription))));
    }

    @Given("l'auteur modifie l'œuvre")
    public void auteur_modifie_oeuvre() throws Exception {
        Oeuvre work = oeuvres.findById(requireOeuvreId()).orElseThrow();
        authSteps.authenticateAs(work.getAuthor().getUsername(), work.getAuthor().isAdmin());
        editedDescription = "Description modifiée pour le nouveau filtrage";
        updatePrepared = true;
    }

    @Then("les modifications sont enregistrées")
    public void modifications_oeuvre_enregistrees() throws Exception {
        if (updatePrepared) {
            perform(patch("/works/{id}", requireOeuvreId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of("description", editedDescription))));
            updatePrepared = false;
        }
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals(editedDescription, lastResponse().path("description").asText());
    }

    @When("l'utilisateur tente de modifier l'œuvre")
    public void utilisateur_tente_modifier_oeuvre() throws Exception {
        perform(patch("/works/{id}", requireOeuvreId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("description", "Modification non autorisée"))));
    }
    //TODO : a modifier le 0 vers 403
    @Then("la modification est refusée")
    public void modification_oeuvre_refusee() {
        assertEquals(403,scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
    }

    @Then("l'œuvre modifiée est soumise à nouveau au processus de filtrage")
    public void oeuvre_modifiee_soumise_au_filtrage() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals("created", lastResponse().path("status").asText(),
                "Après une modification, le scénario attend une nouvelle soumission au filtrage");
    }

    @When("l'utilisateur supprime l'œuvre")
    public void utilisateur_supprime_oeuvre() throws Exception {
        perform(delete("/works/{id}", requireOeuvreId()));
    }

    @When("l'utilisateur tente de supprimer l'œuvre")
    public void utilisateur_tente_de_supprimer_oeuvre() throws Exception {
        perform(delete("/works/{id}", requireOeuvreId()));
    }
   //TODO : a modifier le 0 vers 403
    @Then("la suppression est refusée")
    public void suppression_oeuvre_refusee() {
         
        assertEquals(403, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
    }

    @Given("une œuvre publiée")
    public void oeuvre_publiee() {
        Category category = ensureCategory("Cucumber published works");
        Oeuvre work = saveWork(fixtureUser("cucumber-published-author", false), uniqueTitle("œuvre publiée"),
                "Description publiée", OeuvreStatus.approved);
        linkCategory(work, category);
        scenarioContext.setCategoryId(category.getCategoryId());
        scenarioContext.setCategoryName(category.getName());
    }

    @When("un visiteur consulte l'œuvre")
    public void visiteur_consulte_oeuvre() throws Exception {
        perform(get("/works/{id}", requireOeuvreId()));
    }

    @Then("les informations de l'œuvre sont affichées")
    public void informations_oeuvre_affichees() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode body = lastResponse();
        assertEquals(scenarioContext.getOeuvreId(), body.path("id").asLong());
        assertEquals("approved", body.path("status").asText());
        assertEquals(scenarioContext.getWorkTitle(), body.path("title").asText());
        assertEquals(scenarioContext.getWorkDescription(), body.path("description").asText());
    }

    @Given("l'œuvre possède des votes")
    public void oeuvre_possede_votes() {
        Oeuvre work = oeuvres.findById(requireOeuvreId()).orElseThrow();
        Vote vote = new Vote();
        vote.setOeuvre(work);
        vote.setUser(fixtureUser("cucumber-voter", false));
        vote.setValue((byte) 1);
        vote.setCreatedAt(LocalDateTime.now());
        votes.save(vote);
        work.getVotes().add(vote);
        expectedVoteCount = 1;
    }

    @When("un utilisateur consulte l'œuvre")
    public void utilisateur_consulte_oeuvre() throws Exception {
        if (expectCommentList) {
            Integer categoryId = scenarioContext.getCategoryId();
            assertNotNull(categoryId, "La lecture des commentaires exige une catégorie");
            perform(get("/categories/{id}/works", categoryId).param("page", "0").param("size", "50"));
        } else {
            perform(get("/works/{id}", requireOeuvreId()));
        }
    }

    @Then("le nombre total de votes de l'œuvre est affiché")
    public void nombre_total_votes_affiche() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals(expectedVoteCount, lastResponse().path("totalVotes").asInt());
    }

    @Given("des commentaires sont associés à cette œuvre")
    public void commentaires_associes_a_oeuvre() {
        Oeuvre work = oeuvres.findById(requireOeuvreId()).orElseThrow();
        Comment comment = new Comment();
        comment.setOeuvre(work);
        comment.setUser(fixtureUser("cucumber-commenter", false));
        comment.setContent("Commentaire de test visible");
        comment.setCreatedAt(LocalDateTime.now());
        comments.save(comment);
        work.getComments().add(comment);
        expectCommentList = true;
    }

    @Then("les commentaires associés à l'œuvre sont affichés")
    public void commentaires_associes_affiches() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode works = lastResponse().path("content");
        boolean commentFound = false;
        for (JsonNode work : works) {
            if (work.path("oeuvreId").asLong() == requireOeuvreId()) {
                for (JsonNode comment : work.path("comments")) {
                    commentFound |= comment.path("content").asText().equals("Commentaire de test visible");
                }
            }
        }
        assertTrue(commentFound, scenarioContext.getResponseBody());
    }

    @After
    public void deleteUploadedImage() throws IOException {
        String imageUrl = scenarioContext.getImageUrl();
        if (imageUrl == null || !imageUrl.startsWith("/uploads/works/")) {
            return;
        }
        String fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        Path uploadRoot = Paths.get(uploadDirectory, "works").toAbsolutePath().normalize();
        Path image = uploadRoot.resolve(fileName).normalize();
        if (image.startsWith(uploadRoot)) {
            Files.deleteIfExists(image);
        }
    }

    private MvcResult perform(MockHttpServletRequestBuilder request) throws Exception {
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        MvcResult result = mockMvc.perform(request).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
        return result;
    }

    private JsonNode lastResponse() throws Exception {
        return objectMapper.readTree(scenarioContext.getResponseBody());
    }

    private void assertValidationMessage(String field, String message) throws Exception {
        assertEquals(422, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals(message, lastResponse().path("fields").path(field).asText());
    }

    private Long requireOeuvreId() {
        assertNotNull(scenarioContext.getOeuvreId(), "Le scénario doit préparer ou créer une œuvre");
        return scenarioContext.getOeuvreId();
    }

    private User scenarioAuthor() {
        String username = scenarioContext.getUsername();
        return username == null ? fixtureUser("cucumber-work-author", false)
                : users.findByUsername(username).orElseGet(() -> fixtureUser(username, false));
    }

    private User fixtureUser(String username, boolean administrator) {
        return users.findByUsername(username).orElseGet(() -> {
            User user = new User();
            user.setUsername(username);
            user.setEmail(username + "@example.com");
            user.setPasswordHash(passwordEncoder.encode("fixture-password"));
            user.setAdmin(administrator);
            user.setCreatedAt(LocalDateTime.now());
            return users.save(user);
        });
    }

    private Oeuvre saveWork(User author, String title, String description, OeuvreStatus status) {
        Oeuvre work = new Oeuvre();
        work.setAuthor(author);
        work.setTitle(title);
        work.setDescription(description);
        work.setStatus(status);
        Oeuvre saved = oeuvres.save(work);
        scenarioContext.setOeuvreId(saved.getOeuvreId());
        scenarioContext.setWorkTitle(saved.getTitle());
        scenarioContext.setWorkDescription(saved.getDescription());
        return saved;
    }

    private Category ensureCategory(String name) {
        return categories.findByName(name).orElseGet(() -> {
            Category category = new Category();
            category.setName(name);
            return categories.save(category);
        });
    }

    private void linkCategory(Oeuvre work, Category category) {
        OeuvreCategory link = new OeuvreCategory();
        link.setId(new OeuvreCategoryId(work.getOeuvreId(), category.getCategoryId()));
        link.setOeuvre(work);
        link.setCategory(category);
        oeuvreCategories.save(link);
    }

    private String uniqueTitle(String prefix) {
        return prefix + " " + UUID.randomUUID();
    }
}
