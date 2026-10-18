package fr.numeronumber1.steps;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import fr.numeronumber1.model.Comment;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.CommentRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.UserRepository;
import fr.numeronumber1.repository.VoteRepository;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

public class PublicProfileSteps {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @Autowired
    private JsonMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OeuvreRepository oeuvreRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User profileUser;
    private User otherUser;

    @Given("l'utilisateur {string} possède un profil public")
    public void utilisateur_possede_profil_public(String username) {
        profileUser = fixtureUser(username);
    }

    public void autre_utilisateur_consulte_profil() throws Exception {
        otherUser = fixtureUser("visitor-" + System.nanoTime());
        consulterProfil();
    }

    @When("l'utilisateur {string} consulte ce profil")
    public void utilisateur_consulte_ce_profil(String username) throws Exception {
        if (profileUser == null && username != null) {
            profileUser = fixtureUser(username);
        }
        consulterProfil();
    }

    @Then("le profil de {string} s'affiche avec succès")
    public void profil_affiche_avec_succes(String username) throws Exception {
        assertEquals(200,
                scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());

        JsonNode json = objectMapper.readTree(
                scenarioContext.getResponseBody());

        assertEquals(username, json.path("username").asText());
    }

    public void profil_est_consulte() throws Exception {
        consulterProfil();
    }

    @Then("le pseudo {string} est affiché")
    public void pseudo_est_affiche_sur_page(String username) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());

        JsonNode json = objectMapper.readTree(
                scenarioContext.getResponseBody());

        assertEquals(username, json.path("username").asText());
    }

    @Given("l'utilisateur {string} a publié {int} œuvres, {int} commentaire, et voté positivement pour {int} œuvres")
    public void utilisateur_a_activite_publique(
            String username,
            int workCount,
            int commentCount,
            int positiveVoteCount) {

        profileUser = fixtureUser(username);

        List<Oeuvre> publishedWorks = new ArrayList<>();

        for (int i = 1; i <= workCount; i++) {
            publishedWorks.add(createApprovedWork(
                    "Œuvre publiée " + i + "-" + System.nanoTime(),
                    profileUser));
        }

        for (int i = 1; i <= commentCount; i++) {
            Comment comment = new Comment();
            comment.setUser(profileUser);
            comment.setOeuvre(publishedWorks.get(0));
            comment.setContent("Commentaire " + i);
            comment.setCreatedAt(LocalDateTime.now());

            commentRepository.save(comment);
        }

        for (int i = 1; i <= positiveVoteCount; i++) {
            User author = fixtureUser(
                    "favorite-author-" + System.nanoTime());

            Oeuvre favorite = createApprovedWork(
                    "Œuvre favorite " + i + "-" + System.nanoTime(),
                    author);

            Vote vote = new Vote();
            vote.setUser(profileUser);
            vote.setOeuvre(favorite);
            vote.setValue((byte) 1);
            vote.setCreatedAt(LocalDateTime.now());

            voteRepository.save(vote);
        }
    }

    public void profil_public_est_consulte() throws Exception {
        consulterProfil();
    }

    @Then("ses {int} œuvres publiées sont affichées sur son profil")
    public void oeuvres_publiees_affichees_sur_profil(int workCount)
            throws Exception {

        assertEquals(200, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());

        JsonNode json = objectMapper.readTree(
                scenarioContext.getResponseBody());

        assertEquals(workCount, json.path("publishedWorks").size());
    }

    @Then("son commentaire est affiché sur son profil")
    public void commentaire_affiche_sur_profil() throws Exception {
        JsonNode json = objectMapper.readTree(
                scenarioContext.getResponseBody());

        JsonNode comments = json.path("comments");

        assertEquals(1, comments.size());
        assertEquals("Commentaire 1",
                comments.get(0).path("content").asText());
    }

    @Then("les {int} œuvres qu'elle a votées positivement sont affichées comme favoris sur son profil")
    public void oeuvres_votees_affichees_comme_favoris(int workCount)
            throws Exception {

        JsonNode json = objectMapper.readTree(
                scenarioContext.getResponseBody());

        JsonNode votedWorks = json.path("votedWorks");
        int positiveVotes = 0;

        for (JsonNode work : votedWorks) {
            if (work.path("voteValue").asInt() == 1) {
                positiveVotes++;
            }
        }

        assertEquals(workCount, positiveVotes);
    }

    @Given("l'utilisateur possede l'adresse e-mail {string}")
    public void utilisateur_possede_email(String emailValue) {
        if (profileUser == null) {
            profileUser = fixtureUser("privacy-" + System.nanoTime());
        }
        if (emailValue != null) {
            profileUser.setEmail(emailValue);
            userRepository.save(profileUser);
        }
    }

    public void autre_utilisateur_consulte_profil_public()
            throws Exception {

        otherUser = fixtureUser("visitor-" + System.nanoTime());
        consulterProfil();
    }

    @Then("l'adresse e-mail {string} n'est pas affichée")
    public void email_utilisateur_non_affiche(String ignoredEmail) {
        assertEquals(200, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());

        String body = scenarioContext.getResponseBody();

        assertNotNull(body);
        assertFalse(body.contains(profileUser.getEmail()));
        assertFalse(body.contains("\"email\""));
        assertFalse(body.contains("passwordHash"));
    }

    private void consulterProfil() throws Exception {
        var request = get(
                "/users/" + profileUser.getUserId() + "/public_profile");

        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }

        MvcResult result = mockMvc.perform(request).andReturn();

        scenarioContext.setResponseStatus(
                result.getResponse().getStatus());

        scenarioContext.setResponseBody(
                result.getResponse().getContentAsString());
    }

    private User fixtureUser(String username) {
        return userRepository.findByUsername(username).orElseGet(() -> {
            User user = new User();
            user.setUsername(username);
            user.setEmail(username + "@example.com");
            user.setPasswordHash(
                    passwordEncoder.encode("password123"));
            user.setAdmin(false);
            user.setCreatedAt(LocalDateTime.now());

            return userRepository.save(user);
        });
    }

    private Oeuvre createApprovedWork(String title, User author) {
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setTitle(title);
        oeuvre.setDescription("Description de " + title);
        oeuvre.setAuthor(author);
        oeuvre.setStatus(OeuvreStatus.approved);
        oeuvre.setScore(0);

        return oeuvreRepository.save(oeuvre);
    }
}
