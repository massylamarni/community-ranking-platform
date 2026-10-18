package fr.numeronumber1.steps;

import fr.numeronumber1.dto.request.VoteRequest;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

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
    private AcceptanceScenarioContext scenarioContext;

    @Autowired
    private AuthSteps authSteps;

    private Long oeuvreId;
    private long voteCountBefore;
    private byte currentVoteValue;

    public void oeuvre_n_appartient_pas_a_utilisateur() {
        setOeuvre(createWork(createUser("vote-author-" + UUID.randomUUID())));
    }

    @Given("l'utilisateur possède déjà un vote actif sur cette œuvre")
    public void utilisateur_possede_deja_vote_actif() {
        ensureWorkExists();
        createVoteForCurrentUser((byte) 1);
    }

    @When("l'utilisateur attribue un vote positif à l'œuvre")
    public void utilisateur_attribue_vote_positif() throws Exception {
        envoyerVote(1);
    }

    @Then("le vote positif est enregistré")
    public void vote_positif_enregistre() throws Exception {
        assertVoteResponse(1);
        Vote vote = findCurrentUserVote();
        assertEquals((byte) 1, vote.getValue());
        assertEquals(1, vote.getOeuvre().getScore());
        assertVoteSummary(1, 1);
    }

    @When("l'utilisateur attribue un vote négatif à l'œuvre")
    public void utilisateur_attribue_vote_negatif() throws Exception {
        envoyerVote(-1);
    }

    @Then("le vote négatif est enregistré")
    public void vote_negatif_enregistre() throws Exception {
        assertVoteResponse(-1);
        Vote vote = findCurrentUserVote();
        assertEquals((byte) -1, vote.getValue());
        assertEquals(-1, vote.getOeuvre().getScore());
        assertVoteSummary(-1, 1);
    }

    @When("l'utilisateur tente d'attribuer un nouveau vote à cette œuvre")
    public void utilisateur_tente_nouveau_vote() throws Exception {
        voteCountBefore = votes.findByOeuvreOeuvreIdAndUserUserId(
                requireOeuvreId(), currentUser().getUserId()).isPresent() ? 1 : 0;
        envoyerVote(1);
    }

    @Then("le système ne crée pas un second vote actif")
    public void systeme_ne_cree_pas_second_vote() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());
        assertEquals(1, responseBody().path("value").asInt());
    }

    @Then("un seul vote reste actif pour cet utilisateur sur cette œuvre")
    public void un_seul_vote_reste_actif() {
        assertEquals(1, votes.findByOeuvreOeuvreIdAndUserUserId(
                requireOeuvreId(), currentUser().getUserId()).stream().count());
        assertEquals(1, voteCountBefore);
    }

    @Given("l'utilisateur a attribué un vote positif à une œuvre")
    public void utilisateur_a_attribue_vote_positif() {
        ensureWorkExists();
        createVoteForCurrentUser((byte) 1);
    }

    @When("l'utilisateur modifie son vote en vote négatif")
    public void utilisateur_modifie_vote_en_negatif() throws Exception {
        envoyerVote(-1);
    }

    @Then("le vote de l'utilisateur devient négatif")
    public void vote_utilisateur_devient_negatif() throws Exception {
        assertVoteResponse(-1);
        assertEquals((byte) -1, findCurrentUserVote().getValue());
        assertEquals(-1, currentWork().getScore());
        assertVoteSummary(-1, 1);
    }

    @Given("l'utilisateur a attribué un vote négatif à une œuvre")
    public void utilisateur_a_attribue_vote_negatif() {
        ensureWorkExists();
        createVoteForCurrentUser((byte) -1);
    }

    @When("l'utilisateur modifie son vote en vote positif")
    public void utilisateur_modifie_vote_en_positif() throws Exception {
        envoyerVote(1);
    }

    @Then("le vote de l'utilisateur devient positif")
    public void vote_utilisateur_devient_positif() throws Exception {
        assertVoteResponse(1);
        assertEquals((byte) 1, findCurrentUserVote().getValue());
        assertEquals(1, currentWork().getScore());
        assertVoteSummary(1, 1);
    }

    @Given("l'utilisateur possède un vote actif sur une œuvre")
    public void utilisateur_possede_vote_actif() {
        ensureWorkExists();
        createVoteForCurrentUser((byte) 1);
    }

    @When("l'utilisateur retire son vote")
    public void utilisateur_retire_vote() throws Exception {
        envoyerVote(null);
    }

    @Then("le vote de l'utilisateur est supprimé")
    public void vote_utilisateur_supprime() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());
        assertTrue(responseBody().path("value").isNull());
        assertTrue(votes.findByOeuvreOeuvreIdAndUserUserId(
                requireOeuvreId(), currentUser().getUserId()).isEmpty());
        assertEquals(0, currentWork().getScore());
        assertVoteSummary(0, 0);
    }

    @When("l'utilisateur tente d'attribuer un vote positif à son œuvre")
    public void tente_vote_positif_sur_oeuvre_personnelle() throws Exception {
        ensureOwnWorkExists();
        envoyerVote(1);
    }

    @When("l'utilisateur tente d'attribuer un vote négatif à son œuvre")
    public void tente_vote_negatif_sur_oeuvre_personnelle() throws Exception {
        ensureOwnWorkExists();
        envoyerVote(-1);
    }

    @Then("le vote est refusé")
    public void vote_est_refuse() {
        assertEquals(403, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());
        assertTrue(votes.findByOeuvreOeuvreIdAndUserUserId(
                requireOeuvreId(), currentUser().getUserId()).isEmpty());
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
    public void score_oeuvre_calcule() throws Exception {
        authSteps.authenticateAs("cucumber-vote-score-user", false);
        envoyerVote(null);
    }

    @Then("le score de l'œuvre est égal à {int}")
    public void score_oeuvre_est_egal(int expectedScore) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());
        assertEquals(expectedScore, currentWork().getScore());
        assertEquals(expectedScore, responseBody().path("oeuvre").path("score").asInt());
    }

    @When("l'utilisateur consulte l'œuvre")
    public void utilisateur_consulte_oeuvre_pour_vote() throws Exception {
        MvcResult result = mockMvc.perform(withSession(
                get("/works/{workId}/vote", requireOeuvreId()))).andReturn();
        capture(result);
        assertEquals(200, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());

        String body = scenarioContext.getResponseBody();
        currentVoteValue = body.isBlank() || objectMapper.readTree(body).isNull()
                ? 0
                : (byte) objectMapper.readTree(body).path("value").asInt();
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
                requireOeuvreId(), currentUser().getUserId()).isEmpty());
    }

    @Then("aucun vote n'est indiqué comme actuellement sélectionné")
    public void aucun_vote_indique_comme_selectionne() {
        assertEquals(0, currentVoteValue);
    }

    private void envoyerVote(Integer value) throws Exception {
        MockHttpServletRequestBuilder request = put(
                "/works/{workId}/vote", requireOeuvreId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new VoteRequest(value)));
        capture(mockMvc.perform(withSession(request)).andReturn());
    }

    private void assertVoteResponse(int expectedValue) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());
        assertEquals(expectedValue, responseBody().path("value").asInt());
        assertEquals(expectedValue,
                responseBody().path("oeuvre").path("score").asInt());
    }

    private void assertVoteSummary(int expectedScore, int expectedVotes)
            throws Exception {
        MvcResult result = mockMvc.perform(
                get("/works/{workId}/votes", requireOeuvreId())).andReturn();
        capture(result);

        assertEquals(200, scenarioContext.getResponseStatus(),
                scenarioContext.getResponseBody());
        JsonNode summary = responseBody();
        assertEquals(expectedScore, summary.path("oeuvre").path("score").asInt());
        assertEquals(expectedVotes, summary.path("votes").size());
    }

    private JsonNode responseBody() throws Exception {
        return objectMapper.readTree(scenarioContext.getResponseBody());
    }

    private MockHttpServletRequestBuilder withSession(
            MockHttpServletRequestBuilder request) {
        MockHttpSession session = scenarioContext.getSession();
        return session == null ? request : request.session(session);
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
        return users.findByUsername(username).orElseGet(() -> {
            User user = new User();
            user.setUsername(username);
            user.setEmail(username + "@example.com");
            user.setPasswordHash("fixture-password");
            user.setAdmin(false);
            user.setCreatedAt(LocalDateTime.now());
            return users.save(user);
        });
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

    private void setOeuvre(Oeuvre oeuvre) {
        oeuvreId = oeuvre.getOeuvreId();
        scenarioContext.setOeuvreId(oeuvreId);
    }

    private void ensureWorkExists() {
        if (oeuvreId == null && scenarioContext.getOeuvreId() != null) {
            oeuvreId = scenarioContext.getOeuvreId();
        }
        if (oeuvreId == null) {
            setOeuvre(createWork(
                    createUser("vote-author-" + UUID.randomUUID())));
        }
    }

    private void ensureOwnWorkExists() {
        ensureWorkExists();
        Oeuvre work = currentWork();
        if (!work.getAuthor().getUserId().equals(currentUser().getUserId())) {
            setOeuvre(createWork(currentUser()));
        }
    }

    private Long requireOeuvreId() {
        ensureWorkExists();
        return oeuvreId;
    }

    private Oeuvre currentWork() {
        return oeuvres.findById(requireOeuvreId()).orElseThrow();
    }

    private void createVoteForCurrentUser(byte value) {
        User user = currentUser();
        Long workId = requireOeuvreId();
        if (votes.findByOeuvreOeuvreIdAndUserUserId(
                workId, user.getUserId()).isPresent()) {
            return;
        }

        Vote vote = new Vote();
        vote.setOeuvre(currentWork());
        vote.setUser(user);
        vote.setValue(value);
        vote.setCreatedAt(LocalDateTime.now());
        votes.save(vote);
        recalculateFixtureScore();
    }

    private void createVotesForOtherUsers(byte value, int count) {
        requireOeuvreId();
        for (int i = 0; i < count; i++) {
            User user = createUser("vote-fixture-" + UUID.randomUUID());
            Vote vote = new Vote();
            vote.setOeuvre(currentWork());
            vote.setUser(user);
            vote.setValue(value);
            vote.setCreatedAt(LocalDateTime.now());
            votes.save(vote);
        }
    }

    private Vote findCurrentUserVote() {
        return votes.findByOeuvreOeuvreIdAndUserUserId(
                requireOeuvreId(), currentUser().getUserId()).orElseThrow(
                () -> new AssertionError("Vote introuvable"));
    }

    private void recalculateFixtureScore() {
        Oeuvre work = currentWork();
        long positive = votes.countByOeuvreOeuvreIdAndValue(
                oeuvreId, (byte) 1);
        long negative = votes.countByOeuvreOeuvreIdAndValue(
                oeuvreId, (byte) -1);
        work.setScore((int) (positive - negative));
        oeuvres.save(work);
    }
}
