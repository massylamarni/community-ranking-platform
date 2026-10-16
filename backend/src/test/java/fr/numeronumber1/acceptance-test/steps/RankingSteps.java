package fr.numeronumber1.steps;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.OeuvreCategory;
import fr.numeronumber1.model.OeuvreCategoryId;
import fr.numeronumber1.model.Ranking;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.model.enums.PeriodType;
import fr.numeronumber1.repository.CategoryRepository;
import fr.numeronumber1.repository.CommentRepository;
import fr.numeronumber1.repository.OeuvreCategoryRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.RankingRepository;
import fr.numeronumber1.repository.UserRepository;
import fr.numeronumber1.repository.VoteRepository;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class RankingSteps {

    @Autowired private MockMvc mockMvc;
    @Autowired private AcceptanceScenarioContext scenarioContext;
    @Autowired private JsonMapper objectMapper;
    @Autowired private OeuvreRepository oeuvreRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private OeuvreCategoryRepository oeuvreCategoryRepository;
    @Autowired private RankingRepository rankingRepository;
    @Autowired private VoteRepository voteRepository;
    @Autowired private CommentRepository commentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private String selectedCategoryFilter;
    private String selectedPeriodFilter;

    @Given("les œuvres publiées suivantes existent dans des catégories différentes :")
    @Given("les œuvres publiées suivantes existent :")
    public void oeuvres_publiees_existent(DataTable table) {
        rankingRepository.deleteAll();
        voteRepository.deleteAll();
        commentRepository.deleteAll();
        oeuvreCategoryRepository.deleteAll();
        oeuvreRepository.deleteAll();

        User author = fixtureUser("ranking-author");

        List<Map<String, String>> rows = table.asMaps(String.class, String.class);
        for (Map<String, String> row : rows) {
            String title = row.get("Œuvre");
            if (title == null) {
                title = row.get("Oeuvre");
            }
            String categoryName = row.get("Catégorie");
            if (categoryName == null) {
                categoryName = row.get("Categorie");
            }
            String scoreStr = row.get("Score");
            int score = scoreStr != null ? Integer.parseInt(scoreStr.trim()) : 0;

            Oeuvre oeuvre = new Oeuvre();
            oeuvre.setTitle(title);
            oeuvre.setDescription("Description de " + title);
            oeuvre.setAuthor(author);
            oeuvre.setStatus(OeuvreStatus.approved);
            oeuvre.setScore(score);
            Oeuvre saved = oeuvreRepository.save(oeuvre);

            if (categoryName != null && !categoryName.isBlank()) {
                Category category = ensureCategory(categoryName);
                OeuvreCategory link = new OeuvreCategory();
                link.setId(new OeuvreCategoryId(saved.getOeuvreId(), category.getCategoryId()));
                link.setOeuvre(saved);
                link.setCategory(category);
                oeuvreCategoryRepository.save(link);
                saved.getOeuvreCategories().add(link);
            }
        }
    }

    @When("l'utilisateur consulte le classement global")
    public void utilisateur_consulte_classement_global() {
        // TODO: préparer la consultation du classement global
    }

    @Then("l'œuvre {string} apparaît en position {int} avec un score de {int}")
    public void oeuvre_apparait_au_rang_avec_score(String title, int position, int score) {
        // TODO: vérifier le rang et le score de l'œuvre
    }

    @When("l'utilisateur consulte le classement de la catégorie {string}")
    public void utilisateur_consulte_classement_categorie(String categoryName) {
        // TODO: préparer la consultation du classement par catégorie
    }

    @Then("l'œuvre {string} n'apparaît pas dans ce classement")
    public void oeuvre_absente_du_classement(String title) {
        // TODO: vérifier l'absence de l'œuvre dans le classement
    }

    @Given("l'œuvre {string} a reçu un vote positif aujourd'hui")
    public void oeuvre_a_recu_vote_positif_aujourd_hui(String title) {
        prepareCleanWork(title);
        addVote(title, 1, LocalDateTime.now());
    }

    @Given("l'œuvre {string} a reçu un vote positif hier, hors de la période du jour en cours")
    public void oeuvre_a_recu_vote_positif_hier(String title) {
        prepareCleanWork(title);
        LocalDateTime yesterday = LocalDate.now().atStartOfDay().minusHours(2);
        addVote(title, 1, yesterday);
    }

    @When("l'utilisateur consulte le classement {string}")
    public void utilisateur_consulte_classement_periode(String period) throws Exception {
        var request = get("/rankings").param("period", period);
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        MvcResult result = mockMvc.perform(request).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    @Then("le vote d'aujourd'hui sur {string} est comptabilisé dans ce classement")
    public void vote_aujourd_hui_comptabilise(String title) throws Exception {
        vote_est_comptabilise(title);
    }

    @Then("le vote d'hier sur {string} n'est pas comptabilisé dans ce classement")
    public void vote_hier_non_comptabilise(String title) throws Exception {
        vote_periode_precedente_non_comptabilise(title);
    }

    @Given("l'œuvre {string} a reçu un vote positif au cours de la semaine en cours")
    public void oeuvre_a_recu_vote_semaine_courante(String title) {
        prepareCleanWork(title);
        addVote(title, 1, LocalDateTime.now());
    }

    @Given("l'œuvre {string} a reçu un vote positif la semaine précédente")
    public void oeuvre_a_recu_vote_semaine_precedente(String title) {
        prepareCleanWork(title);
        LocalDateTime lastWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .atStartOfDay().minusDays(2);
        addVote(title, 1, lastWeek);
    }

    @Then("le vote de {string} est comptabilisé dans ce classement")
    public void vote_est_comptabilise(String title) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode root = objectMapper.readTree(scenarioContext.getResponseBody());
        JsonNode content = root.has("content") ? root.get("content") : root;
        boolean found = false;
        for (JsonNode item : content) {
            if (title.equals(item.path("title").asText())) {
                found = true;
                assertTrue(item.path("score").asInt() > 0,
                        "Le vote de " + title + " devrait être comptabilisé (score > 0) : " + item);
                break;
            }
        }
        assertTrue(found, "L'œuvre " + title + " n'a pas été trouvée dans le classement : " + scenarioContext.getResponseBody());
    }

    @Then("le vote de {string} datant de la semaine précédente n'est pas comptabilisé dans ce classement")
    public void vote_semaine_precedente_non_comptabilise(String title) throws Exception {
        vote_periode_precedente_non_comptabilise(title);
    }

    @Given("l'œuvre {string} a reçu un vote positif au cours du mois en cours")
    public void oeuvre_a_recu_vote_mois_courant(String title) {
        prepareCleanWork(title);
        addVote(title, 1, LocalDateTime.now());
    }

    @Given("l'œuvre {string} a reçu un vote positif le mois précédent")
    public void oeuvre_a_recu_vote_mois_precedent(String title) {
        prepareCleanWork(title);
        LocalDateTime lastMonth = LocalDate.now().withDayOfMonth(1)
                .atStartOfDay().minusDays(2);
        addVote(title, 1, lastMonth);
    }

    @Then("le vote de {string} datant du mois précédent n'est pas comptabilisé dans ce classement")
    public void vote_mois_precedent_non_comptabilise(String title) throws Exception {
        vote_periode_precedente_non_comptabilise(title);
    }

    private void vote_periode_precedente_non_comptabilise(String title) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode root = objectMapper.readTree(scenarioContext.getResponseBody());
        JsonNode content = root.has("content") ? root.get("content") : root;
        for (JsonNode item : content) {
            if (title.equals(item.path("title").asText())) {
                assertEquals(0, item.path("score").asInt(),
                        "Le vote passé de " + title + " ne devrait pas être comptabilisé dans cette période : " + item);
            }
        }
    }

    private java.util.Optional<Oeuvre> findOeuvreByTitle(String title) {
        return oeuvreRepository.findAll().stream()
                .filter(o -> title.equals(o.getTitle()))
                .findFirst();
    }

    private void prepareCleanWork(String title) {
        findOeuvreByTitle(title).ifPresent(o -> {
            List<Vote> votes = voteRepository.findAll().stream()
                    .filter(v -> v.getOeuvre().getOeuvreId().equals(o.getOeuvreId()))
                    .toList();
            voteRepository.deleteAll(votes);
        });
    }

    private Oeuvre ensureApprovedOeuvre(String title) {
        return findOeuvreByTitle(title).orElseGet(() -> {
            User author = fixtureUser("author-" + title.replaceAll("[^a-zA-Z0-9]", ""));
            Category category = ensureCategory("Général");
            Oeuvre o = new Oeuvre();
            o.setTitle(title);
            o.setDescription("Description de " + title);
            o.setAuthor(author);
            o.setStatus(OeuvreStatus.approved);
            o.setScore(0);
            Oeuvre saved = oeuvreRepository.save(o);

            OeuvreCategory oc = new OeuvreCategory();
            oc.setId(new OeuvreCategoryId(saved.getOeuvreId(), category.getCategoryId()));
            oc.setOeuvre(saved);
            oc.setCategory(category);
            oeuvreCategoryRepository.save(oc);

            return saved;
        });
    }

    private void addVote(String title, int value, LocalDateTime createdAt) {
        Oeuvre oeuvre = ensureApprovedOeuvre(title);
        String voterName = "voter-" + title.replaceAll("[^a-zA-Z0-9]", "") + "-" + System.nanoTime();
        User voter = fixtureUser(voterName);

        Vote vote = new Vote();
        vote.setOeuvre(oeuvre);
        vote.setUser(voter);
        vote.setValue((byte) value);
        vote.setCreatedAt(createdAt);
        voteRepository.save(vote);
    }

    @Given("l'utilisateur consulte le classement d'une catégorie où l'œuvre {string} affiche un score de {int}")
    public void classement_categorie_affiche_score(String title, int score) {
        // TODO: préparer le classement et le score affiché
    }

    @When("un autre utilisateur attribue un vote positif à l'œuvre {string}")
    public void autre_utilisateur_vote_positivement(String title) {
        // TODO: préparer l'ajout d'un vote positif
    }

    @Then("le score de {string} affiché passe à {int}")
    public void score_affiche_est_mis_a_jour(String title, int score) {
        // TODO: vérifier la mise à jour du score
    }

    @Then("cette mise à jour s'affiche sans que l'utilisateur ait besoin de recharger la page")
    public void mise_a_jour_sans_rechargement() {
        // TODO: vérifier la mise à jour sans rechargement
    }

    @Given("le classement hebdomadaire de la semaine précédente a été archivé avec le résultat {string}, {string}, {string}")
    public void classement_precedent_archive(String firstTitle, String secondTitle, String thirdTitle) {
        rankingRepository.deleteAll();
        voteRepository.deleteAll();
        commentRepository.deleteAll();
        oeuvreCategoryRepository.deleteAll();
        oeuvreRepository.deleteAll();

        LocalDate lastMonday = LocalDate.now().minusWeeks(1).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        saveArchivedWork(firstTitle, (byte) 1, 30, lastMonday);
        saveArchivedWork(secondTitle, (byte) 2, 20, lastMonday);
        saveArchivedWork(thirdTitle, (byte) 3, 10, lastMonday);
    }

    private void saveArchivedWork(String title, byte position, int score, LocalDate periodStart) {
        Oeuvre oeuvre = ensureApprovedOeuvre(title);
        Ranking ranking = new Ranking();
        ranking.setPeriodType(PeriodType.week);
        ranking.setPeriodStart(periodStart);
        ranking.setRankPosition(position);
        ranking.setOeuvre(oeuvre);
        ranking.setScore(score);
        ranking.setCategory(null);
        rankingRepository.save(ranking);
    }

    @When("l'utilisateur accède à la section des classements précédents")
    public void utilisateur_accede_anciens_classements() throws Exception {
        var request = get("/rankings/archives/periods").param("periodType", "week");
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        MvcResult result = mockMvc.perform(request).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    @When("il sélectionne la semaine précédente")
    public void selectionne_semaine_precedente() throws Exception {
        var request = get("/rankings/archives").param("periodType", "week");
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        MvcResult result = mockMvc.perform(request).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    @Then("le classement affiché est exactement {string}, {string}, {string}")
    public void classement_affiche_est_exact(String firstTitle, String secondTitle, String thirdTitle) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode root = objectMapper.readTree(scenarioContext.getResponseBody());
        JsonNode content = root.has("content") ? root.get("content") : root;

        assertTrue(content.size() >= 3, "Le classement doit contenir au moins 3 œuvres : " + scenarioContext.getResponseBody());
        assertEquals(firstTitle, content.get(0).path("title").asText(), "1ère place incorrecte : " + content);
        assertEquals(secondTitle, content.get(1).path("title").asText(), "2ème place incorrecte : " + content);
        assertEquals(thirdTitle, content.get(2).path("title").asText(), "3ème place incorrecte : " + content);
    }

    @Given("l'utilisateur consulte le classement global comportant des œuvres de plusieurs catégories")
    public void classement_global_multi_categories() throws Exception {
        rankingRepository.deleteAll();
        voteRepository.deleteAll();
        commentRepository.deleteAll();
        oeuvreCategoryRepository.deleteAll();
        oeuvreRepository.deleteAll();

        User author = fixtureUser("ranking-author");
        Category music = ensureCategory("Musique");
        Category photo = ensureCategory("Photographie");

        createApprovedOeuvreWithCategory("Musique 1", 15, music, author);
        createApprovedOeuvreWithCategory("Musique 2", 9, music, author);
        createApprovedOeuvreWithCategory("Photo 1", 20, photo, author);

        utilisateur_consulte_classement_global();
    }

    private Oeuvre createApprovedOeuvreWithCategory(String title, int score, Category category, User author) {
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setTitle(title);
        oeuvre.setDescription("Description de " + title);
        oeuvre.setAuthor(author);
        oeuvre.setStatus(OeuvreStatus.approved);
        oeuvre.setScore(score);
        Oeuvre saved = oeuvreRepository.save(oeuvre);

        if (category != null) {
            OeuvreCategory link = new OeuvreCategory();
            link.setId(new OeuvreCategoryId(saved.getOeuvreId(), category.getCategoryId()));
            link.setOeuvre(saved);
            link.setCategory(category);
            oeuvreCategoryRepository.save(link);
            saved.getOeuvreCategories().add(link);
        }
        return saved;
    }

    @When("il sélectionne le filtre {string}")
    public void selectionne_filtre_classement(String filter) {
        String categoryName = filter;
        if (filter.contains(":")) {
            categoryName = filter.substring(filter.indexOf(':') + 1).trim();
        }
        this.selectedCategoryFilter = categoryName;
    }

    @When("il valide le filtre")
    public void valide_filtre_classement() throws Exception {
        Integer categoryId = categoryRepository.findByName(this.selectedCategoryFilter)
                .map(Category::getCategoryId)
                .orElse(null);

        var request = get("/rankings");
        if (categoryId != null) {
            request.param("categoryId", String.valueOf(categoryId));
        }
        if (scenarioContext.getSession() != null) {
            request.session(scenarioContext.getSession());
        }
        MvcResult result = mockMvc.perform(request).andReturn();
        scenarioContext.setResponseStatus(result.getResponse().getStatus());
        scenarioContext.setResponseBody(result.getResponse().getContentAsString());
    }

    @Then("seules les œuvres de la catégorie {string} restent affichées")
    public void seules_oeuvres_categorie_affichees(String categoryName) throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode root = objectMapper.readTree(scenarioContext.getResponseBody());
        JsonNode content = root.has("content") ? root.get("content") : root;

        assertTrue(content.size() > 0, "Au moins une œuvre devrait être affichée : " + scenarioContext.getResponseBody());
        for (JsonNode item : content) {
            boolean hasCategory = false;
            for (JsonNode cat : item.path("categories")) {
                if (categoryName.equalsIgnoreCase(cat.asText())) {
                    hasCategory = true;
                    break;
                }
            }
            assertTrue(hasCategory, "L'œuvre " + item.path("title").asText()
                    + " n'appartient pas à la catégorie " + categoryName + " : " + item);
        }
    }

    @Then("elles restent triées par score")
    public void oeuvres_restent_triees_par_score() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode root = objectMapper.readTree(scenarioContext.getResponseBody());
        JsonNode content = root.has("content") ? root.get("content") : root;

        int previousScore = Integer.MAX_VALUE;
        for (JsonNode item : content) {
            int currentScore = item.path("score").asInt();
            assertTrue(currentScore <= previousScore,
                    "Les œuvres ne sont pas triées par score décroissant : " + scenarioContext.getResponseBody());
            previousScore = currentScore;
        }
    }

    @Given("l'utilisateur consulte le classement avec la période {string} sélectionnée")
    public void classement_consulte_avec_periode(String period) throws Exception {
        rankingRepository.deleteAll();
        voteRepository.deleteAll();
        commentRepository.deleteAll();
        oeuvreCategoryRepository.deleteAll();
        oeuvreRepository.deleteAll();

        prepareCleanWork("Oeuvre Mois Courant");
        addVote("Oeuvre Mois Courant", 1, LocalDateTime.now());

        prepareCleanWork("Oeuvre Mois Precedent");
        LocalDateTime lastMonth = LocalDate.now().withDayOfMonth(1)
                .atStartOfDay().minusDays(2);
        addVote("Oeuvre Mois Precedent", 1, lastMonth);

        utilisateur_consulte_classement_periode(period);
    }

    @When("il sélectionne la période {string}")
    public void selectionne_periode_classement(String period) {
        this.selectedPeriodFilter = period;
    }

    @When("il valide ce choix")
    public void valide_choix_periode() throws Exception {
        utilisateur_consulte_classement_periode(this.selectedPeriodFilter);
    }

    @Then("le classement affiché est recalculé pour refléter uniquement les votes du mois en cours")
    public void classement_recalcule_pour_mois_courant() throws Exception {
        assertEquals(200, scenarioContext.getResponseStatus(), scenarioContext.getResponseBody());
        JsonNode root = objectMapper.readTree(scenarioContext.getResponseBody());
        JsonNode content = root.has("content") ? root.get("content") : root;

        boolean currentMonthFound = false;
        for (JsonNode item : content) {
            String title = item.path("title").asText();
            int score = item.path("score").asInt();
            if ("Oeuvre Mois Courant".equals(title)) {
                currentMonthFound = true;
                assertEquals(1, score, "L'œuvre du mois courant doit avoir son vote comptabilisé : " + item);
            } else if ("Oeuvre Mois Precedent".equals(title)) {
                assertEquals(0, score, "L'œuvre du mois précédent ne doit pas avoir son vote comptabilisé : " + item);
            }
        }
        assertTrue(currentMonthFound, "L'œuvre du mois courant doit être présente dans le classement");
    }
}
