package fr.numeronumber1.steps;

import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.UserRepository;
import fr.numeronumber1.repository.VoteRepository;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

public class VoteSteps {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OeuvreRepository oeuvres;

    @Autowired
    private VoteRepository votes;

    @Autowired
    private UserRepository users;

    @Autowired
    private JsonMapper objectMapper;

    @Autowired
    private fr.numeronumber1.steps.AcceptanceScenarioContext scenarioContext;

    @Autowired
    private fr.numeronumber1.steps.AuthSteps authSteps;

    private Long oeuvreId;
    private Integer voteCountBefore;
    private int initialScore;
    private byte currentVoteValue;

    @Given("une œuvre qui n'appartient pas à l'utilisateur")
    public void oeuvre_n_appartient_pas_a_utilisateur() {
        User author = createUser("vote-author-" + UUID.randomUUID());

        Oeuvre oeuvre = createWork(author);
        this.oeuvreId = oeuvre.getOeuvreId();

        scenarioContext.setOeuvreId(oeuvreId);
    }

    @Given("l'utilisateur possède déjà un vote actif sur cette œuvre")
    public void utilisateur_possede_deja_vote_actif() {
        ensureWorkExists();
        createVoteForCurrentUser((byte) 1);
    }

    @When("l'utilisateur attribue un vote positif à l'œuvre")
    public void utilisateur_attribue_vote_positif() throws Exception {
        envoyerVote("positive");
    }

    @Then("le vote positif est enregistré")
    public void vote_positif_enregistre() {
        assertEquals(201, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());

        Vote vote = findCurrentUserVote();

        assertEquals((byte) 1, vote.getValue());
        assertEquals(1, vote.getOeuvre().getScore());
    }

    @When("l'utilisateur attribue un vote négatif à l'œuvre")
    public void utilisateur_attribue_vote_negatif() throws Exception {
        envoyerVote("negative");
    }

    @Then("le vote négatif est enregistré")
    public void vote_negatif_enregistre() {
        assertEquals(201, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());

        Vote vote = findCurrentUserVote();

        assertEquals((byte) -1, vote.getValue());
        assertEquals(-1, vote.getOeuvre().getScore());
    }

    @When("l'utilisateur tente d'attribuer un nouveau vote à cette œuvre")
    public void utilisateur_tente_nouveau_vote() throws Exception {
        voteCountBefore = votes.findByOeuvreOeuvreIdAndUserUserId(
                oeuvreId, currentUser().getUserId()).isPresent() ? 1 : 0;

        envoyerVote("positive");
    }

    @Then("le système ne crée pas un second vote actif")
    public void systeme_ne_cree_pas_second_vote() {
        assertNotEquals(201, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());
    }

    @Then("un seul vote reste actif pour cet utilisateur sur cette œuvre")
    public void un_seul_vote_reste_actif() {
        assertEquals(1, votes.findByOeuvreOeuvreIdAndUserUserId(
                oeuvreId, currentUser().getUserId()).stream().count());

        assertEquals(voteCountBefore, 1);
    }

    @Given("l'utilisateur a attribué un vote positif à une œuvre")
    public void utilisateur_a_attribue_vote_positif() {
        ensureWorkExists();
        createVoteForCurrentUser((byte) 1);
    }

    @When("l'utilisateur modifie son vote en vote négatif")
    public void utilisateur_modifie_vote_en_negatif() throws Exception {
        envoyerModificationVote("negative");
    }

    @Then("le vote de l'utilisateur devient négatif")
    public void vote_utilisateur_devient_negatif() {
        assertEquals(200, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());

        Vote vote = findCurrentUserVote();

        assertEquals((byte) -1, vote.getValue());
        assertEquals(-1, vote.getOeuvre().getScore());
    }

    @Given("l'utilisateur a attribué un vote négatif à une œuvre")
    public void utilisateur_a_attribue_vote_negatif() {
        ensureWorkExists();
        createVoteForCurrentUser((byte) -1);
    }

    @When("l'utilisateur modifie son vote en vote positif")
    public void utilisateur_modifie_vote_en_positif() throws Exception {
        envoyerModificationVote("positive");
    }

    @Then("le vote de l'utilisateur devient positif")
    public void vote_utilisateur_devient_positif() {
        assertEquals(200, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());

        Vote vote = findCurrentUserVote();

        assertEquals((byte) 1, vote.getValue());
        assertEquals(1, vote.getOeuvre().getScore());
    }

    @Given("l'utilisateur possède un vote actif sur une œuvre")
    public void utilisateur_possede_vote_actif() {
        ensureWorkExists();
        createVoteForCurrentUser((byte) 1);
    }

    @When("l'utilisateur retire son vote")
    public void utilisateur_retire_vote() throws Exception {
        MockHttpServletRequestBuilder request = delete(
                "/votes/work/{id}", oeuvreId);

        MvcResult result = mockMvc.perform(withSession(request)).andReturn();
        capture(result);
    }

    @Then("le vote de l'utilisateur est supprimé")
    public void vote_utilisateur_supprime() {
        assertEquals(204, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());

        assertTrue(votes.findByOeuvreOeuvreIdAndUserUserId(
                oeuvreId, currentUser().getUserId()).isEmpty());

        assertEquals(0, oeuvres.findById(oeuvreId).orElseThrow().getScore());
    }

    @When("l'utilisateur tente d'attribuer un vote positif à son œuvre")
    public void tente_vote_positif_sur_oeuvre_personnelle() throws Exception {
        ensureOwnWorkExists();
        envoyerVote("positive");
    }

    @Then("le vote est refusé")
    public void vote_est_refuse() {
        assertNotEquals(201, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());

        assertTrue(votes.findByOeuvreOeuvreIdAndUserUserId(
                oeuvreId, currentUser().getUserId()).isEmpty());
    }

    @When("l'utilisateur tente d'attribuer un vote négatif à son œuvre")
    public void tente_vote_negatif_sur_oeuvre_personnelle() throws Exception {
        ensureOwnWorkExists();
        envoyerVote("negative");
    }

    @Given("une œuvre possède {int} votes positifs")
    public void oeuvre_possede_votes_positifs(int voteCount) {
        ensureWorkExists();
        createVotesForOtherUsers((byte) 1, voteCount);
    }

    @Given("l'œuvre possède {int} votes négatifs")
    public void oeuvre_possede_votes_negatifs(int voteCount) {
        ensureWorkExists();
        createVotesForOtherUsers((byte) -1, voteCount);
    }

    @When("le score de l'œuvre est calculé")
    public void score_oeuvre_calcule() {
        Oeuvre oeuvre = oeuvres.findById(oeuvreId).orElseThrow();

        long positive = votes.countByOeuvreOeuvreIdAndValue(
                oeuvreId, (byte) 1);

        long negative = votes.countByOeuvreOeuvreIdAndValue(
                oeuvreId, (byte) -1);

        oeuvre.setScore((int) (positive - negative));
        oeuvres.save(oeuvre);
    }

    @Then("le score de l'œuvre est égal à {int}")
    public void score_oeuvre_est_egal(int expectedScore) {
        Oeuvre oeuvre = oeuvres.findById(oeuvreId).orElseThrow();

        assertEquals(expectedScore, oeuvre.getScore());
    }

    @When("l'utilisateur consulte l'œuvre")
    public void utilisateur_consulte_oeuvre_pour_vote() throws Exception {
        Vote vote = votes.findByOeuvreOeuvreIdAndUserUserId(
                oeuvreId, currentUser().getUserId()).orElse(null);

        currentVoteValue = vote == null ? 0 : vote.getValue();

        MockHttpServletRequestBuilder request = get("/works/{id}", oeuvreId);

        MvcResult result = mockMvc.perform(withSession(request)).andReturn();
        capture(result);
    }

    @Then("l'interface indique que le vote positif est actuellement sélectionné")
    public void interface_indique_vote_positif_selectionne() {
        assertEquals(1, currentVoteValue);
    }

    @Then("l'interface indique que le vote négatif est actuellement sélectionné")
    public void interface_indique_vote_negatif_selectionne() {
        assertEquals(-1, currentVoteValue);
    }

    @Given("l'utilisateur n'a pas voté pour une œuvre")
    public void utilisateur_n_a_pas_vote() {
        ensureWorkExists();

        assertTrue(votes.findByOeuvreOeuvreIdAndUserUserId(
                oeuvreId, currentUser().getUserId()).isEmpty());
    }

    @Then("aucun vote n'est indiqué comme actuellement sélectionné")
    public void aucun_vote_indique_comme_selectionne() {
        assertEquals(0, currentVoteValue);
    }

    private void envoyerVote(String type) throws Exception {
        Map<String, String> body = Map.of("type", type);

        MockHttpServletRequestBuilder request = post(
                "/votes/work/{id}", oeuvreId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body));

        capture(mockMvc.perform(withSession(request)).andReturn());
    }

    private void envoyerModificationVote(String type) throws Exception {
        Map<String, String> body = Map.of("type", type);

        MockHttpServletRequestBuilder request = patch(
                "/votes/work/{id}", oeuvreId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body));

        capture(mockMvc.perform(withSession(request)).andReturn());
    }

    private MockHttpServletRequestBuilder withSession(
            MockHttpServletRequestBuilder request) {

        MockHttpSession session = scenarioContext.getSession();

        if (session != null) {
            request.session(session);
        }

        return request;
    }

    private void capture(MvcResult result) throws Exception {
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    private User currentUser() {
        return users.findByUsername(scenarioContext.getUsername())
                .orElseThrow(() -> new AssertionError(
                        "Utilisateur authentifié introuvable"));
    }

    private User createUser(String username) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        user.setPasswordHash("fixture-password");
        user.setAdmin(false);
        user.setCreatedAt(LocalDateTime.now());

        return users.save(user);
    }

    private Oeuvre createWork(User author) {
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setTitle("Vote test " + UUID.randomUUID());
        oeuvre.setDescription("Œuvre créée pour les tests d'acceptation");
        oeuvre.setAuthor(author);
        oeuvre.setStatus(OeuvreStatus.approved);
        oeuvre.setScore(0);

        return oeuvres.save(oeuvre);
    }

    private void ensureWorkExists() {
        if (oeuvreId != null) {
            return;
        }

        Oeuvre oeuvre = createWork(
                createUser("vote-author-" + UUID.randomUUID()));

        oeuvreId = oeuvre.getOeuvreId();
        scenarioContext.setOeuvreId(oeuvreId);
    }

    private void ensureOwnWorkExists() {
        User user = currentUser();

        Oeuvre oeuvre = createWork(user);

        oeuvreId = oeuvre.getOeuvreId();
        scenarioContext.setOeuvreId(oeuvreId);
    }

    private void createVoteForCurrentUser(byte value) {
        User user = currentUser();

        if (votes.findByOeuvreOeuvreIdAndUserUserId(
                oeuvreId, user.getUserId()).isPresent()) {
            return;
        }

        Vote vote = new Vote();
        vote.setOeuvre(oeuvres.findById(oeuvreId).orElseThrow());
        vote.setUser(user);
        vote.setValue(value);
        vote.setCreatedAt(LocalDateTime.now());

        votes.save(vote);
        recalculateScore();
    }

    private void createVotesForOtherUsers(byte value, int count) {
        for (int i = 0; i < count; i++) {
            User user = createUser("vote-fixture-" + UUID.randomUUID());

            Vote vote = new Vote();
            vote.setOeuvre(oeuvres.findById(oeuvreId).orElseThrow());
            vote.setUser(user);
            vote.setValue(value);
            vote.setCreatedAt(LocalDateTime.now());

            votes.save(vote);
        }

        recalculateScore();
    }

    private Vote findCurrentUserVote() {
        return votes.findByOeuvreOeuvreIdAndUserUserId(
                oeuvreId, currentUser().getUserId()).orElseThrow(
                () -> new AssertionError("Vote introuvable"));
    }

    private void recalculateScore() {
        Oeuvre oeuvre = oeuvres.findById(oeuvreId).orElseThrow();

        long positive = votes.countByOeuvreOeuvreIdAndValue(
                oeuvreId, (byte) 1);

        long negative = votes.countByOeuvreOeuvreIdAndValue(
                oeuvreId, (byte) -1);

        oeuvre.setScore((int) (positive - negative));
        oeuvres.save(oeuvre);
    }
}