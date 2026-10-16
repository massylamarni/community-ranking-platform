package fr.numeronumber1.steps;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import fr.numeronumber1.model.Comment;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.CommentRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.UserRepository;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class CommentSteps {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper objectMapper;

    @Autowired
    private UserRepository users;

    @Autowired
    private OeuvreRepository oeuvres;

    @Autowired
    private CommentRepository comments;

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @Autowired
    private AuthSteps authSteps;

    private Integer commentId;
    private Integer parentCommentId;
    private String pendingContent;
    private String expectedAuthor;
    private MockMultipartFile pendingImage;
    private int commentsBeforeRequest;

    @Given("{string} a publié le commentaire {string} sur {string}")
    public void utilisateur_a_publie_commentaire_sur_oeuvre(
            String username, String content, String title) {
        User commenter = fixtureUser(username, false);
        Oeuvre work = workForScenario(title, fixtureUser(uniqueUsername("comment-work-owner"), false));
        Comment comment = saveComment(work, commenter, content, null);
        rememberComment(comment);
    }

    @When("l'administrateur supprime le commentaire")
    public void administrateur_supprime_commentaire() throws Exception {
        ensureAuthenticatedUser(true);
        if (commentId == null) {
            User commenter = fixtureUser(uniqueUsername("comment-author"), false);
            Oeuvre work = workForScenario("Commentaire à supprimer",
                    fixtureUser(uniqueUsername("comment-work-owner"), false));
            rememberComment(saveComment(work, commenter, "Commentaire à supprimer", null));
        }
        deleteCurrentComment();
    }

    @Then("le commentaire n'est plus visible sur {string}")
    public void commentaire_n_est_plus_visible_sur_oeuvre(String title) {
        assertEquals(204, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertFalse(comments.existsById(requireCommentId()),
                "Le commentaire doit avoir été supprimé de l'œuvre " + title);
    }

    @Then("le commentaire n'est plus visible sur le profil de {string}")
    public void commentaire_n_est_plus_visible_sur_profil(String username) {
        assertEquals(204, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        User user = users.findByUsername(username)
                .orElseThrow(() -> new AssertionError("Utilisateur introuvable : " + username));
        assertFalse(user.getComments().stream()
                        .anyMatch(comment -> comment.getCommentId().equals(requireCommentId())),
                "Le commentaire supprimé ne doit plus apparaître sur le profil de " + username);
    }

    @When("il rédige le commentaire {string}")
    public void redige_commentaire(String content) throws Exception {
        ensureAuthenticatedUser(false);
        ensureWorkForAuthenticatedUser(false);
        pendingContent = content;
        pendingImage = null;
    }

    @When("il valide la publication")
    public void valide_publication_commentaire() throws Exception {
        ensureAuthenticatedUser(false);
        ensureWorkForAuthenticatedUser(false);
        String content = pendingContent == null ? "Commentaire de test" : pendingContent;
        commentsBeforeRequest = comments.findByOeuvreOeuvreIdOrderByCommentIdAsc(
                requireOeuvreId()).size();

        MvcResult result;
        if (pendingImage != null) {
            result = mockMvc.perform(multipart("/works/{workId}/comments", requireOeuvreId())
                            .file(pendingImage)
                            .param("content", content)
                            .session(scenarioContext.getSession()))
                    .andReturn();
        } else {
            result = mockMvc.perform(post("/works/{workId}/comments", requireOeuvreId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(Map.of("content", content)))
                            .session(scenarioContext.getSession()))
                    .andReturn();
        }
        capture(result);
        if (scenarioContext.getResponseStatus() == 201) {
            rememberResponseComment();
        }
    }

    @Then("le commentaire {string} est enregistré")
    public void commentaire_est_enregistre(String expectedContent) throws Exception {
        assertEquals(201, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode body = responseBody();
        assertEquals(expectedContent, body.path("content").asText(), scenarioContext.getResponseBody());
        assertEquals(expectedContent, comments.findById(requireCommentId())
                .orElseThrow(() -> new AssertionError("Le commentaire n'a pas été persisté"))
                .getContent());
    }

    @Then("il est affiché sous l'œuvre concernée avec son auteur")
    public void commentaire_affiche_avec_auteur() throws Exception {
        assertEquals(201, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode body = responseBody();
        assertEquals(scenarioContext.getUsername(), body.path("author").path("username").asText(),
                scenarioContext.getResponseBody());
        Comment saved = comments.findById(requireCommentId())
                .orElseThrow(() -> new AssertionError("Le commentaire n'est pas visible en base"));
        assertEquals(scenarioContext.getUsername(), saved.getUser().getUsername());
    }

    @When("il tente de publier le commentaire {string}")
    public void tente_publier_commentaire(String content) throws Exception {
        ensurePublishedWorkForVisitor();
        pendingContent = content;
        commentsBeforeRequest = comments.findByOeuvreOeuvreIdOrderByCommentIdAsc(
                requireOeuvreId()).size();
        capture(mockMvc.perform(post("/works/{workId}/comments", requireOeuvreId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("content", content))))
                .andReturn());
    }

    @Then("le système l'empêche de publier le commentaire")
    public void systeme_empeche_publication_commentaire() throws Exception {
        assertEquals(401, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals("Vous devez être connecté pour commenter.",
                responseBody().path("error").asText(), scenarioContext.getResponseBody());
    }

    @Then("le commentaire n'est pas enregistré")
    public void commentaire_n_est_pas_enregistre() {
        assertEquals(commentsBeforeRequest,
                comments.findByOeuvreOeuvreIdOrderByCommentIdAsc(requireOeuvreId()).size(),
                "La requête refusée ne doit créer aucun commentaire");
        assertFalse(comments.findByOeuvreOeuvreIdOrderByCommentIdAsc(requireOeuvreId()).stream()
                .anyMatch(comment -> pendingContent.equals(comment.getContent())));
    }

    @Then("un message indique qu'il doit être connecté pour commenter")
    public void message_connexion_requise_pour_commenter() throws Exception {
        assertEquals("Vous devez être connecté pour commenter.",
                responseBody().path("error").asText(), scenarioContext.getResponseBody());
    }

    @When("il modifie ce commentaire en {string}")
    public void modifie_commentaire(String updatedContent) throws Exception {
        ensureCommentByCurrentUser();
        pendingContent = updatedContent;
    }

    @When("il valide la modification")
    public void valide_modification_commentaire() throws Exception {
        ensureCommentByCurrentUser();
        String content = pendingContent == null ? "Commentaire modifié" : pendingContent;
        capture(mockMvc.perform(patch("/comments/{commentId}", requireCommentId())
                        .session(scenarioContext.getSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("content", content))))
                .andReturn());
    }

    @Then("le commentaire affiché sous l'œuvre est {string}")
    public void commentaire_affiche_est(String expectedContent) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals(expectedContent, responseBody().path("content").asText(),
                scenarioContext.getResponseBody());
        assertEquals(expectedContent, comments.findById(requireCommentId())
                .orElseThrow(() -> new AssertionError("Le commentaire est introuvable"))
                .getContent());
    }

    @Given("un commentaire est publié sous une œuvre")
    public void commentaire_publie_sous_oeuvre() {
        User commenter = fixtureUser(uniqueUsername("comment-author"), false);
        User owner = fixtureUser(uniqueUsername("comment-work-owner"), false);
        Oeuvre work = workForScenario("Commentaire publié", owner);
        rememberComment(saveComment(work, commenter, "Commentaire publié sous une œuvre", null));
    }

    @When("un administrateur supprime ce commentaire")
    public void administrateur_supprime_ce_commentaire() throws Exception {
        ensureAuthenticatedUser(true);
        ensureCommentExistsForDeletion();
        deleteCurrentComment();
    }

    @Then("le commentaire n'est plus affiché sous l'œuvre")
    public void commentaire_n_est_plus_affiche_sous_oeuvre() {
        assertEquals(204, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertFalse(comments.existsById(requireCommentId()));
    }

    @Then("le commentaire n'est plus affiché sous l'œuvre concernée")
    public void commentaire_n_est_plus_affiche_sous_oeuvre_concernee() {
        assertEquals(204, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertFalse(comments.existsById(requireCommentId()));
    }

    @Given("l'utilisateur {string} publie un commentaire sous une œuvre")
    public void utilisateur_publie_commentaire(String username) {
        User commenter = fixtureUser(username, false);
        Oeuvre work = workForScenario("Commentaire de " + username,
                fixtureUser(uniqueUsername("comment-work-owner"), false));
        rememberComment(saveComment(work, commenter, "Commentaire de " + username, null));
        expectedAuthor = username;
    }

    @When("l'œuvre est consultée")
    public void oeuvre_est_consultee() throws Exception {
        capture(mockMvc.perform(get("/works/{workId}/comments", requireOeuvreId()))
                .andReturn());
    }

    @When("il supprime ce commentaire")
    public void il_supprime_ce_commentaire() throws Exception {
        ensureCommentByCurrentUser();
        deleteCurrentComment();
    }

    @Then("le commentaire affiché indique {string} comme auteur")
    public void commentaire_indique_auteur(String author) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertEquals(author, expectedAuthor, "L'auteur attendu doit être celui du scénario");
        JsonNode items = responseBody().path("items");
        assertTrue(items.isArray(), scenarioContext.getResponseBody());
        boolean authorFound = false;
        for (JsonNode item : items) {
            if (commentId.toString().equals(item.path("id").asText())) {
                authorFound = author.equals(item.path("author").path("username").asText());
                break;
            }
        }
        assertTrue(authorFound, "Le pseudo doit être visible dans la réponse: "
                + scenarioContext.getResponseBody());
    }

    @When("il associe une image à ce commentaire")
    public void associe_image_au_commentaire() throws Exception {
        ensureAuthenticatedUser(false);
        ensureWorkForAuthenticatedUser(false);
        pendingContent = pendingContent == null ? "Commentaire avec image" : pendingContent;
        pendingImage = new MockMultipartFile(
                "image", "test.png", "image/png", new byte[] {
                        (byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
                });
    }

    @When("il tente de publier un commentaire principal sur cette œuvre")
    public void tente_publier_commentaire_principal() throws Exception {
        User author = ensureAuthenticatedUser(false);
        ensureWorkOwnedByCurrentUser(author);
        pendingContent = "Commentaire principal interdit";
        commentsBeforeRequest = comments.findByOeuvreOeuvreIdOrderByCommentIdAsc(
                requireOeuvreId()).size();
        capture(mockMvc.perform(post("/works/{workId}/comments", requireOeuvreId())
                        .session(scenarioContext.getSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("content", pendingContent))))
                .andReturn());
    }

    @Then("l'action est refusée par le système")
    public void action_refusee_par_systeme() throws Exception {
        assertEquals(403, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertTrue(responseBody().path("error").asText().contains("propre œuvre"),
                scenarioContext.getResponseBody());
        assertEquals(commentsBeforeRequest,
                comments.findByOeuvreOeuvreIdOrderByCommentIdAsc(requireOeuvreId()).size());
    }

    @Then("un message indique qu'il ne peut pas commenter sa propre œuvre")
    public void message_commentaire_sur_propre_oeuvre_interdit() throws Exception {
        assertTrue(responseBody().path("error").asText().contains("propre œuvre"),
                scenarioContext.getResponseBody());
    }

    @Then("le commentaire est publié avec l'image associée")
    public void commentaire_publie_avec_image() throws Exception {
        assertEquals(201, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode body = responseBody();
        assertEquals(pendingContent, body.path("content").asText());
        assertTrue(body.path("imageUrl").asText().startsWith("/uploads/comments/"),
                scenarioContext.getResponseBody());
        Comment saved = comments.findById(requireCommentId())
                .orElseThrow(() -> new AssertionError("Le commentaire avec image n'a pas été persisté"));
        assertEquals(body.path("imageUrl").asText(), saved.getImageUrl());
    }

    @When("l'auteur de l'œuvre répond à ce commentaire")
    public void auteur_repond_au_commentaire() throws Exception {
        User workAuthor = ensureAuthenticatedUser(false);
        ensureWorkOwnedByCurrentUser(workAuthor);
        Comment parent = comments.findByOeuvreOeuvreIdOrderByCommentIdAsc(requireOeuvreId())
                .stream()
                .findFirst()
                .orElseGet(() -> saveComment(
                        oeuvres.findById(requireOeuvreId()).orElseThrow(),
                        fixtureUser(uniqueUsername("comment-outsider"), false),
                        "Commentaire d'un tiers", null));
        parentCommentId = parent.getCommentId();
        pendingContent = "Réponse de l'auteur";
        capture(mockMvc.perform(post("/works/{workId}/comments", requireOeuvreId())
                        .session(scenarioContext.getSession())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "content", pendingContent,
                                "parentCommentId", parentCommentId))))
                .andReturn());
        if (scenarioContext.getResponseStatus() == 201) {
            rememberResponseComment();
        }
    }

    @Then("la réponse est enregistrée")
    public void reponse_est_enregistree() throws Exception {
        assertEquals(201, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode body = responseBody();
        assertEquals(pendingContent, body.path("content").asText());
        Comment reply = comments.findById(requireCommentId())
                .orElseThrow(() -> new AssertionError("La réponse n'a pas été persistée"));
        assertEquals(parentCommentId, reply.getParentComment().getCommentId());
    }

    @Then("elle est affichée sous l'œuvre concernée")
    public void reponse_affichee_sous_oeuvre() throws Exception {
        capture(mockMvc.perform(get("/works/{workId}/comments", requireOeuvreId()))
                .andReturn());
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode roots = responseBody().path("items");
        boolean replyFound = false;
        for (JsonNode root : roots) {
            for (JsonNode reply : root.path("replies")) {
                if (commentId.toString().equals(reply.path("id").asText())) {
                    replyFound = pendingContent.equals(reply.path("content").asText());
                }
            }
        }
        assertTrue(replyFound, "La réponse doit apparaître dans les réponses imbriquées: "
                + scenarioContext.getResponseBody());
    }

    @Given("l'œuvre {string} a reçu {int} commentaires publiés")
    public void oeuvre_a_recu_commentaires(String title, int commentCount) {
        User owner = fixtureUser(uniqueUsername("comment-work-owner"), false);
        Oeuvre work = workForScenario(title, owner);
        User commenter = fixtureUser(uniqueUsername("comment-author"), false);
        for (int index = 1; index <= commentCount; index++) {
            saveComment(work, commenter, "Commentaire " + index, null);
        }
    }

    @When("cette œuvre est consultée")
    public void cette_oeuvre_est_consultee() throws Exception {
        capture(mockMvc.perform(get("/works/{workId}/comments", requireOeuvreId()))
                .andReturn());
    }

    @Then("les {int} commentaires sont affichés sous l'œuvre")
    public void commentaires_affiches_sous_oeuvre(int commentCount) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode items = responseBody().path("items");
        assertTrue(items.isArray(), scenarioContext.getResponseBody());
        assertEquals(commentCount, items.size(), scenarioContext.getResponseBody());
        assertEquals(commentCount, responseBody().path("total").asInt());
    }

    @Given("un commentaire publié ne respecte pas les règles définies par le site")
    public void commentaire_ne_respecte_pas_regles() {
        User commenter = fixtureUser(uniqueUsername("comment-author"), false);
        Oeuvre work = workForScenario("Commentaire à modérer",
                fixtureUser(uniqueUsername("comment-work-owner"), false));
        rememberComment(saveComment(work, commenter, "Contenu non conforme à modérer", null));
    }

    @When("un administrateur consulte ce commentaire")
    public void administrateur_consulte_commentaire() throws Exception {
        ensureAuthenticatedUser(true);
        ensureCommentExistsForDeletion();
        capture(mockMvc.perform(get("/works/{workId}/comments", requireOeuvreId())
                .session(scenarioContext.getSession()))
                .andReturn());
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        assertTrue(responseBody().path("items").isArray(), scenarioContext.getResponseBody());
    }

    @When("il le supprime dans le cadre de la modération")
    public void supprime_commentaire_pour_moderation() throws Exception {
        ensureAuthenticatedUser(true);
        ensureCommentExistsForDeletion();
        deleteCurrentComment();
    }

    @When("un utilisateur non administrateur tente de le supprimer au titre de la modération")
    public void utilisateur_non_admin_tente_suppression_moderation() throws Exception {
        ensureAuthenticatedUser(false);
        ensureCommentExistsForDeletion();
        deleteCurrentComment();
    }

    private User ensureAuthenticatedUser(boolean administrator) throws Exception {
        String username = scenarioContext.getUsername();
        User currentUser = username == null ? null : users.findByUsername(username).orElse(null);
        if (scenarioContext.getSession() == null || currentUser == null
                || currentUser.isAdmin() != administrator) {
            authSteps.authenticateAs(uniqueUsername(administrator ? "comment-admin" : "comment-user"),
                    administrator);
            currentUser = users.findByUsername(scenarioContext.getUsername()).orElseThrow();
        }
        return currentUser;
    }

    private void ensureWorkForAuthenticatedUser(boolean ownedByCurrentUser) throws Exception {
        User currentUser = ensureAuthenticatedUser(false);
        if (ownedByCurrentUser) {
            ensureWorkOwnedByCurrentUser(currentUser);
            return;
        }
        if (scenarioContext.getOeuvreId() == null) {
            workForScenario("Commentaire de test",
                    fixtureUser(uniqueUsername("comment-work-owner"), false));
        }
    }

    private void ensureWorkOwnedByCurrentUser(User currentUser) {
        Oeuvre currentWork = scenarioContext.getOeuvreId() == null
                ? null : oeuvres.findById(scenarioContext.getOeuvreId()).orElse(null);
        if (currentWork == null || !currentWork.getAuthor().getUserId().equals(currentUser.getUserId())) {
            workForScenario("Œuvre personnelle", currentUser);
        }
    }

    private void ensurePublishedWorkForVisitor() {
        scenarioContext.setSession(null);
        scenarioContext.setUsername(null);
        scenarioContext.setAdministrator(false);
        if (scenarioContext.getOeuvreId() == null) {
            workForScenario("Œuvre consultée par un visiteur",
                    fixtureUser(uniqueUsername("comment-work-owner"), false));
        }
    }

    private void ensureCommentByCurrentUser() throws Exception {
        User currentUser = ensureAuthenticatedUser(false);
        if (commentId == null) {
            commentId = scenarioContext.getCommentId();
        }
        Comment currentComment = commentId == null ? null : comments.findById(commentId).orElse(null);
        if (currentComment == null) {
            Oeuvre work = workForScenario("Commentaire à modifier",
                    fixtureUser(uniqueUsername("comment-work-owner"), false));
            currentComment = saveComment(work, currentUser, "Superbe travail", null);
            rememberComment(currentComment);
        }
    }

    private void ensureCommentExistsForDeletion() {
        if (commentId == null) {
            commentId = scenarioContext.getCommentId();
        }
        Comment currentComment = commentId == null ? null : comments.findById(commentId).orElse(null);
        if (currentComment == null) {
            User commenter = fixtureUser(uniqueUsername("comment-author"), false);
            Oeuvre work = workForScenario("Commentaire à supprimer",
                    fixtureUser(uniqueUsername("comment-work-owner"), false));
            rememberComment(saveComment(work, commenter, "Commentaire à supprimer", null));
        }
    }

    private void deleteCurrentComment() throws Exception {
        capture(mockMvc.perform(delete("/comments/{commentId}", requireCommentId())
                .session(scenarioContext.getSession()))
                .andReturn());
    }

    private Oeuvre workForScenario(String title, User owner) {
        Oeuvre work = new Oeuvre();
        work.setTitle(title + " " + UUID.randomUUID());
        work.setDescription("Œuvre de test pour les scénarios de commentaires");
        work.setAuthor(owner);
        work.setStatus(OeuvreStatus.approved);
        Oeuvre saved = oeuvres.save(work);
        scenarioContext.setOeuvreId(saved.getOeuvreId());
        scenarioContext.setWorkTitle(saved.getTitle());
        scenarioContext.setWorkDescription(saved.getDescription());
        return saved;
    }

    private Comment saveComment(Oeuvre work, User author, String content, Comment parent) {
        Comment comment = new Comment();
        comment.setOeuvre(work);
        comment.setUser(author);
        comment.setParentComment(parent);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());
        return comments.save(comment);
    }

    private User fixtureUser(String username, boolean administrator) {
        return users.findByUsername(username).orElseGet(() -> {
            User user = new User();
            user.setUsername(username);
            user.setEmail(username + "@example.com");
            user.setPasswordHash("fixture-password-hash");
            user.setAdmin(administrator);
            user.setCreatedAt(LocalDateTime.now());
            return users.save(user);
        });
    }

    private void rememberComment(Comment comment) {
        commentId = comment.getCommentId();
        scenarioContext.setCommentId(comment.getCommentId());
        scenarioContext.setCommentContent(comment.getContent());
        scenarioContext.setOeuvreId(comment.getOeuvre().getOeuvreId());
        scenarioContext.setWorkTitle(comment.getOeuvre().getTitle());
    }

    private void rememberResponseComment() throws Exception {
        JsonNode body = responseBody();
        assertTrue(body.path("id").isValueNode(), scenarioContext.getResponseBody());
        commentId = Integer.valueOf(body.path("id").asText());
        scenarioContext.setCommentId(commentId);
        scenarioContext.setCommentContent(body.path("content").asText());
    }

    private void capture(MvcResult result) throws Exception {
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    private JsonNode responseBody() throws Exception {
        assertNotNull(scenarioContext.getResponseBody());
        return objectMapper.readTree(scenarioContext.getResponseBody());
    }

    private Long requireOeuvreId() {
        Long workId = scenarioContext.getOeuvreId();
        assertNotNull(workId, "Le scénario doit préparer l'œuvre avant l'action");
        return workId;
    }

    private Integer requireCommentId() {
        assertNotNull(commentId, "Le scénario doit préparer ou créer un commentaire");
        return commentId;
    }

    private String uniqueUsername(String prefix) {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        return prefix.substring(0, Math.min(prefix.length(), 37)) + "-" + suffix;
    }
}
