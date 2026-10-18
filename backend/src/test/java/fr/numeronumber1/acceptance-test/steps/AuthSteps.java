package fr.numeronumber1.steps;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.verify;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Comment;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.PasswordResetToken;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.CategoryRepository;
import fr.numeronumber1.repository.CommentRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.PasswordResetTokenRepository;
import fr.numeronumber1.repository.UserRepository;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

public class AuthSteps {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper objectMapper;

    @Autowired
    private UserRepository users;

    @Autowired
    private CategoryRepository categories;

    @Autowired
    private OeuvreRepository oeuvres;

    @Autowired
    private CommentRepository comments;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokens;

    private final Map<String, Object> form = new HashMap<>();
    private String username;
    private String email;
    private String password;
    private String oldPassword;
    private String newPassword;
    private String resetToken;
    private int responseStatus;
    private String responseBody = "";
    private MockHttpSession session;
    private String page;
    private TransactionStatus scenarioTransaction;
    private String oeuvreTitle;
    private String oeuvreDescription;
    private String categoryName;
    private Integer categoryId;
    private Long oeuvreId;
    private boolean registrationUserExistedBeforeRequest;

    @Before
    public void resetScenarioState() {
        scenarioTransaction = transactionManager.getTransaction(new DefaultTransactionDefinition());
        form.clear();
        username = null;
        email = null;
        password = null;
        oldPassword = null;
        newPassword = null;
        responseStatus = 0;
        responseBody = "";
        scenarioContext.clear();
        session = null;
        page = "";
        resetToken = null;
        oeuvreTitle = null;
        oeuvreDescription = null;
        categoryName = null;
        categoryId = null;
        oeuvreId = null;
        registrationUserExistedBeforeRequest = false;
        clearInvocations(mailSender);
    }

    @After
    public void rollbackScenarioData() {
        if (scenarioTransaction != null && !scenarioTransaction.isCompleted()) {
            transactionManager.rollback(scenarioTransaction);
        }
    }

    public void un_internaute_se_trouve_sur_la_page_dinscription() {
        page = "register";
    }

    @Given("un visiteur est sur la page de création de compte")
    public void un_visiteur_est_sur_la_page_de_creation_de_compte() {
        page = "register";
    }

    @Given("l'utilisateur est sur la page de connexion")
    public void utilisateur_sur_page_connexion() {
        page = "login";
    }

    @Given("un compte existe avec le pseudo {string} et le mot de passe {string}")
    public void compte_existe_avec_identifiants(String requestedUsername, String requestedPassword) {
        username = requestedUsername;
        email = requestedUsername + "@example.com";
        password = requestedPassword;
        saveAccount(username, email, password);
    }

    @Given("l'utilisateur {string} est authentifié")
    public void utilisateur_est_authentifie(String requestedUsername) throws Exception {
        authenticateAs(requestedUsername, false);
    }

    @Given("l'utilisateur {string} est sur la page de proposition d'œuvre")
    public void utilisateur_est_sur_page_proposition_oeuvre(String requestedUsername) throws Exception {
        authenticateAs(requestedUsername, false);
        page = "work-proposal";
    }

    @Given("un compte existe avec l'adresse e-mail {string}")
    public void compte_existe_avec_email(String requestedEmail) {
        email = requestedEmail;
        username = requestedEmail.substring(0, requestedEmail.indexOf('@'));
        password = "oldPassword!";
        saveAccount(username, email, password);
    }

    @Given("la catégorie {string} existe")
    public void categorie_existe(String requestedName) {
        Category category = categories.findAll().stream()
                .filter(existing -> existing.getName().equals(requestedName))
                .findFirst()
                .orElseGet(() -> {
                    Category created = new Category();
                    created.setName(requestedName);
                    return categories.save(created);
                });
        categoryName = category.getName();
        categoryId = category.getCategoryId();
        scenarioContext.setCategoryName(categoryName);
        scenarioContext.setCategoryId(categoryId);
    }

    @Given("un visiteur n'est pas authentifié")
    public void visiteur_non_authentifie() {
        session = null;
        scenarioContext.setSession(null);
        scenarioContext.setUsername(null);
    }

    public void utilisateur_demande_reinitialisation() {
        page = "forgot-password";
    }

    public void il_saisit_des_identifiants_et_informations_valides() throws Exception {
        username = "alice";
        email = "alice@example.com";
        password = "MotDePasse123!";
        submitRegistration();
    }

    @When("il saisit le pseudo {string}")
    public void il_saisit_le_pseudo(String value) {
        username = value;
        form.put("username", value);
    }

    @When("il saisit l'adresse e-mail {string}")
    public void il_saisit_l_adresse_email(String value) {
        email = value;
        form.put("email", value);
    }

    @When("il saisit le mot de passe {string}")
    public void il_saisit_le_mot_de_passe(String value) {
        password = value;
        form.put("password", value);
    }

    public void il_saisit_comme_identifiant(String value) {
        username = value;
    }

    @When("il saisit {string} comme pseudo")
    public void il_saisit_comme_pseudo(String value) {
        username = value;
        form.put("username", value);
    }

    @When("il saisit {string} comme mot de passe")
    public void il_saisit_comme_mot_de_passe(String value) {
        password = value;
    }

    @When("il saisit {string} comme ancien mot de passe")
    public void il_saisit_comme_ancien_mot_de_passe(String value) {
        oldPassword = value;
    }

    @When("il saisit {string} comme nouveau mot de passe")
    public void il_saisit_comme_nouveau_mot_de_passe(String value) {
        newPassword = value;
        if (!"reset-password".equals(page)) {
            page = "change-password";
        }
    }

    @When("il confirme {string}")
    public void il_confirme(String value) {
        form.put("confirmPassword", value);
    }

    @When("il saisit {string}")
    public void il_saisit_une_valeur(String value) {
        if (value.contains("@")) {
            email = value;
        } else {
            username = value;
        }
    }

   @When("il ne saisit pas de pseudo")
   public void il_ne_saisit_pas_de_pseudo() {
       username = null;
       form.put("username", "");
   }

   @Given("il est sur la page de modification de mot de passe")
   public void il_est_sur_la_page_de_modification_de_mot_de_passe() {
       page = "change-password";
   }

   @Given("il est sur la page de demande de réinitialisation du mot de passe")
   public void il_est_sur_la_page_de_demande_de_reinitialisation_du_mot_de_passe() {
       page = "forgot-password";
   }

   @When("il valide le formulaire")
   public void il_valide_le_formulaire() throws Exception {
       if ("register".equals(page)) {
           submitRegistration();
       } else if ("change-password".equals(page) || "reset-password".equals(page)) {
           changePassword();
       } else {
           login(username, password);
       }
   }

    public void il_valide_la_demande() throws Exception {
        Map<String, Object> request = Map.of("email", email);
        capture(mockMvc.perform(post("/auth/password/forgot")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))));
    }

    @When("il se déconnecte")
    public void il_se_deconnecte() throws Exception {
        var request = post("/auth/logout");

   
        if (session != null) {
            request.session(session);
        } else {
           
            throw new IllegalStateException("Tentative de déconnexion sans session active.");
        }

        capture(mockMvc.perform(request));
        session = null; 
    }

    @When("il tente d'accéder à son espace utilisateur")
    public void il_tente_acces_espace_utilisateur() throws Exception {
        capture(mockMvc.perform(get("/auth/me")));
    }

    public void il_saisit_mot_de_passe_actuel() {
        oldPassword = password;
    }

    public void il_saisit_et_confirme_nouveau_mot_de_passe(String value) {
        newPassword = value;
        form.put("confirmPassword", value);
        page = "change-password";
    }

    @When("il valide la demande de réinitialisation de son mot de passe")
    public void il_demande_reinitialisation_mot_de_passe() throws Exception {
        page = "forgot-password";
        il_valide_la_demande();
    }

    @Given("l'utilisateur {string} a reçu un lien de réinitialisation valide")
    public void utilisateur_a_recu_un_lien_de_reinitialisation_valide(String requestedUsername) {
        username = requestedUsername;
        email = requestedUsername + "@example.com";
        resetToken = createValidResetToken(requestedUsername);
        page = "reset-password";
    }

    @When("il ouvre le lien de réinitialisation")
    public void il_ouvre_le_lien_de_reinitialisation() {
        page = "reset-password";
    }

    public void il_saisit_adresse_email_associee() {
        form.put("email", email);
    }

    public void il_confirme_reinitialisation() {
        form.put("confirmPassword", newPassword);
    }

    public void il_valide_formulaire_reinitialisation() throws Exception {
        il_valide_la_demande();
    }

    @When("il saisit le titre {string}")
    public void il_saisit_titre_oeuvre(String title) {
        elle_saisit_titre_oeuvre(title);
    }

    public void elle_saisit_titre_oeuvre(String title) {
        oeuvreTitle = title;
        scenarioContext.setWorkTitle(title);
    }

    @When("l'utilisateur {string} saisit le titre {string}")
    public void utilisateur_saisit_titre_oeuvre(String username, String title) throws Exception {
        authenticateAs(username, false);
        elle_saisit_titre_oeuvre(title);
    }

    @When("il saisit la description {string}")
    public void il_saisit_description_oeuvre(String description) {
        elle_saisit_description_oeuvre(description);
    }

    public void elle_saisit_description_oeuvre(String description) {
        oeuvreDescription = description;
        scenarioContext.setWorkDescription(description);
    }

    @When("l'utilisateur {string} saisit la description {string}")
    public void utilisateur_saisit_description_oeuvre(String username, String description) throws Exception {
        authenticateAs(username, false);
        elle_saisit_description_oeuvre(description);
    }

    @When("il renseigne les autres informations obligatoires")
    public void il_renseigne_les_autres_informations_obligatoires() {
        if (!scenarioContext.isDescriptionWasOmitted() && scenarioContext.getWorkDescription() == null) {
            scenarioContext.setWorkDescription("Description de validation");
        }
    }

    public void elle_selectionne_categorie(String requestedName) {
        categoryName = requestedName;
        categoryId = categories.findAll().stream()
                .filter(category -> category.getName().equals(requestedName))
                .map(Category::getCategoryId)
                .findFirst()
                .orElseThrow(() -> new AssertionError("Catégorie introuvable: " + requestedName));
        scenarioContext.setCategoryName(categoryName);
        scenarioContext.setCategoryId(categoryId);
    }

    @When("l'utilisateur {string} sélectionne la catégorie {string}")
    public void utilisateur_selectionne_categorie(String username, String requestedName) throws Exception {
        authenticateAs(username, false);
        elle_selectionne_categorie(requestedName);
    }

    @When("l'utilisateur {string} valide la création")
    public void utilisateur_valide_creation_oeuvre(String username) throws Exception {
        authenticateAs(username, false);
        elle_valide_creation_oeuvre();
    }

    public void elle_valide_creation_oeuvre() throws Exception {
        String title = scenarioContext.getWorkTitle() != null ? scenarioContext.getWorkTitle() : oeuvreTitle;
        String description = scenarioContext.getWorkDescription() != null
                ? scenarioContext.getWorkDescription() : oeuvreDescription;
        MvcResult created;
        if (scenarioContext.getImageFileName() != null) {
            var image = new org.springframework.mock.web.MockMultipartFile(
                    "image", scenarioContext.getImageFileName(), "image/jpeg", new byte[] { 1 });
            var createCall = org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart("/works")
                    .file(image)
                    .param("title", title == null ? "" : title)
                    .param("description", description == null ? "" : description);
            if (session != null) {
                createCall.session(session);
            }
            created = mockMvc.perform(createCall).andReturn();
        } else {
            Map<String, Object> createRequest = new HashMap<>();
            createRequest.put("title", title);
            createRequest.put("description", description);
            var createCall = post("/works")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createRequest));
            if (session != null) {
                createCall.session(session);
            }
            created = mockMvc.perform(createCall).andReturn();
        }
        capture(created);
        if (responseStatus == 201) {
            oeuvreId = objectMapper.readTree(responseBody).path("id").asLong();
            scenarioContext.setOeuvreId(oeuvreId);
            JsonNode createdBody = objectMapper.readTree(responseBody);
            scenarioContext.setImageUrl(createdBody.path("imageUrl").isTextual()
                    ? createdBody.path("imageUrl").asText() : null);
            Integer requestedCategoryId = categoryId != null ? categoryId : scenarioContext.getCategoryId();
            if (requestedCategoryId != null) {
                Map<String, Object> submitRequest = Map.of("categoryIds", java.util.List.of(requestedCategoryId));
                var submitCall = post("/works/{id}/submit", oeuvreId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitRequest));
                if (session != null) {
                    submitCall.session(session);
                }
                capture(mockMvc.perform(submitCall));
            }
        }
    }

    @When("il tente de créer une œuvre")
    public void visiteur_tente_creer_oeuvre() throws Exception {
        Map<String, Object> createRequest = Map.of(
                "title", "Œuvre visiteur",
                "description", "Création non autorisée"
        );
        capture(mockMvc.perform(post("/works")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))));
    }

    @When("il consulte son profil")
    public void elle_consulte_son_profil() throws Exception {
        var request = get("/profile");
        if (session != null) {
            request.session(session);
        }
        capture(mockMvc.perform(request));
    }

    public void elle_modifie_information_profil() {
        form.put("username", username);
        form.put("email", "alice.updated@example.com");
    }

    @When("il modifie son pseudo en {string}")
    public void il_modifie_son_pseudo_en(String pseudo) {
        username = pseudo;
        form.put("username", pseudo);
    }

    @When("il valide les modifications")
    public void elle_valide_modifications() throws Exception {
        var request = org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(form));
        if (session != null) {
            request.session(session);
        }
        capture(mockMvc.perform(request));
    }

    public void le_compte_est_cree_avec_succes() {
        assertEquals(201, responseStatus);
        assertTrue(users.existsByUsername(username));
    }

    @Then("le compte {string} est créé")
    public void le_compte_est_cree(String requestedUsername) {
        assertEquals(201, responseStatus, responseBody);
        assertTrue(users.existsByUsername(requestedUsername));
    }

    @Then("le compte n'est pas créé")
    public void le_compte_n_est_pas_cree() {
        assertNotEquals(201, responseStatus, responseBody);
        if (username != null && !registrationUserExistedBeforeRequest) {
            assertFalse(users.existsByUsername(username));
        }
    }

    @Then("un message de confirmation est affiché")
    public void message_confirmation_est_affiche() {
        assertEquals(201, responseStatus, responseBody);
        assertTrue(responseBody.contains(username));
    }

    @Then("un message indique que le pseudo est obligatoire")
    public void message_indique_pseudo_obligatoire() {
        assertTrue(responseBody.toLowerCase().contains("utilisateur"), responseBody);
    }

    @Then("un message indique que l'adresse e-mail est invalide")
    public void message_indique_email_invalide() {
        assertTrue(responseBody.toLowerCase().contains("email")
                || responseBody.toLowerCase().contains("e-mail"), responseBody);
    }

    @Then("l'utilisateur peut se connecter avec ses identifiants")
    public void utilisateur_peut_se_connecter() throws Exception {
        login(username, password);
        assertEquals(200, responseStatus, responseBody);
    }

    @Then("l'utilisateur est authentifié")
    public void utilisateur_est_authentifie() throws Exception {
        assertEquals(200, responseStatus, responseBody);
        var request = get("/auth/me");
        if (session != null) {
            request.session(session);
        }
        capture(mockMvc.perform(request));
        assertEquals(200, responseStatus, responseBody);
    }

    @Then("l'utilisateur n'est pas authentifié")
    public void utilisateur_n_est_pas_authentifie() {
        assertEquals(401, responseStatus, responseBody);
    }

    public void utilisateur_n_est_plus_authentifie() throws Exception {
        assertEquals(200, responseStatus);
        capture(mockMvc.perform(get("/auth/me")));
        assertEquals(401, responseStatus, responseBody);
    }

    public void ressource_publique_reste_accessible_apres_deconnexion() throws Exception {
        capture(mockMvc.perform(get("/categories")));
        assertEquals(200, responseStatus, responseBody);
    }

    @Then("il est redirigé vers une page accessible aux visiteurs")
    public void ressource_visiteur_accessible_apres_deconnexion() throws Exception {
        capture(mockMvc.perform(get("/categories")));
        assertEquals(200, responseStatus, responseBody);
    }

    @Then("il est redirigé vers son espace utilisateur")
    public void redirige_vers_espace_utilisateur() throws Exception {
        var request = get("/auth/me");
        if (session != null) {
            request.session(session);
        }
        capture(mockMvc.perform(request));
        assertEquals(200, responseStatus, responseBody);
    }

    @Then("l'accès lui est refusé")
    public void acces_est_refuse() {
        assertEquals(401, responseStatus, responseBody);
    }

    @Then("il est invité à se connecter")
    public void invite_a_se_connecter() {
        assertEquals(401, responseStatus, responseBody);
    }

    @Then("l'utilisateur {string} n'est plus authentifié")
    public void utilisateur_n_est_plus_authentifie(String requestedUsername) {
        assertTrue(session == null || !requestedUsername.equals(username),
                "L'utilisateur doit être déconnecté");
    }

    @Then("un message indique que les identifiants sont incorrects")
    public void message_identifiants_incorrects() {
        assertEquals(401, responseStatus, responseBody);
    }

    @Then("le mot de passe est modifié")
    public void mot_de_passe_est_modifie() {
        assertEquals(204, responseStatus, responseBody);
        assertTrue(passwordEncoder.matches(newPassword,
                users.findByUsername(username).orElseThrow().getPasswordHash()));
    }

    @Then("il peut se connecter avec {string}")
    public void connexion_avec_nouveau_mot_de_passe(String requestedPassword) throws Exception {
        login(username, requestedPassword);
        assertEquals(200, responseStatus, responseBody);
    }

    public void procedure_reinitialisation_envoyee() {
        assertTrue(responseStatus == 200 || responseStatus == 202 || responseStatus == 204,
                responseBody);
        if (mailSender != null) {
            verify(mailSender).send(any(org.springframework.mail.SimpleMailMessage.class));
        }
    }

    @Then("un message de réinitialisation est envoyé à l'adresse {string}")
    public void procedure_reinitialisation_envoyee(String ignoredAddress) {
        procedure_reinitialisation_envoyee();
    }

    @Then("son pseudo {string} est affiché")
    public void son_pseudo_est_affiche(String expectedUsername) throws Exception {
        assertEquals(200, responseStatus, responseBody);
        JsonNode profile = objectMapper.readTree(responseBody);
        assertEquals(expectedUsername, profile.path("username").asText());
    }

    @Then("son adresse e-mail {string} est affichée")
    public void son_adresse_email_est_affichee(String expectedEmail) throws Exception {
        assertEquals(200, responseStatus, responseBody);
        JsonNode profile = objectMapper.readTree(responseBody);
        assertEquals(expectedEmail, profile.path("email").asText());
    }

    @Then("son nouveau pseudo est {string}")
    public void son_nouveau_pseudo_est(String expectedUsername) {
        assertEquals(200, responseStatus, responseBody);
        assertEquals(expectedUsername, users.findByUsername(username)
                .orElseThrow().getUsername());
    }

    @Then("son nouveau pseudo {string} est affiché dans son profil")
    public void son_nouveau_pseudo_est_affiche_dans_son_profil(String expectedUsername) throws Exception {
        assertEquals(200, responseStatus, responseBody);
        JsonNode profile = objectMapper.readTree(responseBody);
        assertEquals(expectedUsername, profile.path("username").asText());
    }

    @Given("son profil contient le pseudo {string}")
    public void profil_contient_pseudo(String expectedUsername) {
        assertEquals(expectedUsername, users.findByUsername(username)
                .orElseThrow().getUsername());
    }

    @Given("son profil contient l'adresse e-mail {string}")
    public void profil_contient_email(String expectedEmail) {
        assertEquals(expectedEmail, users.findByUsername(username)
                .orElseThrow().getEmail());
    }

    @Then("l'œuvre {string} est créée")
    public void oeuvre_est_creee(String expectedTitle) {
        assertEquals(200, responseStatus, responseBody);
        assertNotNull(oeuvreId);
        Oeuvre created = oeuvres.findById(oeuvreId).orElseThrow();
        assertEquals(expectedTitle, created.getTitle());
        assertEquals("pending", created.getStatus().name());
    }

    @Then("l'œuvre est associée à l'utilisateur {string}")
    public void oeuvre_associee_au_deposant(String expectedAuthor) throws Exception {
        JsonNode result = objectMapper.readTree(responseBody);
        assertEquals(expectedAuthor, result.path("author").asText());
        assertEquals(expectedAuthor, oeuvres.findById(oeuvreId).orElseThrow()
                .getAuthor().getUsername());
    }

    @Then("l'œuvre n'est pas créée")
    public void oeuvre_n_est_pas_creee() {
        assertTrue(responseStatus == 401 || responseStatus == 422, responseBody);
    }

    public void nouvelle_information_est_enregistree() {
        assertEquals(200, responseStatus, responseBody);
        assertEquals("alice.updated@example.com", users.findByUsername(username)
                .orElseThrow().getEmail());
    }

    public void nouvelle_information_est_affichee_dans_profil() throws Exception {
        assertEquals(200, responseStatus, responseBody);
        JsonNode profile = objectMapper.readTree(responseBody);
        assertEquals("alice.updated@example.com", profile.path("email").asText());
    }

    public void administrateur_est_connecte() throws Exception {
        authenticateAs("cucumber-admin", true);
    }

    public void administrateur_est_authentifie() throws Exception {
        authenticateAs("cucumber-admin", true);
    }

    @Given("je suis connecté en tant que {string}")
    public void je_suis_connecte_en_tant_que(String requestedUsername) throws Exception {
        boolean administrator = "Administrateur".equalsIgnoreCase(requestedUsername);
        authenticateAs(administrator ? "cucumber-admin" : requestedUsername, administrator);
    }

    public void administrateur_authentifie() throws Exception {
        authenticateAs("cucumber-admin", true);
    }

    public void utilisateur_est_authentifie_sans_identifiant() throws Exception {
        authenticateAs("cucumber-user", false);
    }

    @Given("un utilisateur non authentifié")
    public void utilisateur_non_authentifie_sans_session() {
        session = null;
        scenarioContext.setSession(null);
        scenarioContext.setUsername(null);
        scenarioContext.setAdministrator(false);
    }

    @Given("un utilisateur non administrateur est authentifié")
    public void utilisateur_non_administrateur_est_authentifie() throws Exception {
        authenticateAs("cucumber-category-user", false);
    }

    @Given("un visiteur non authentifié consulte une œuvre")
    public void visiteur_non_authentifie_consulte_oeuvre() {
        // TODO: préparer la consultation visiteur d'une œuvre
    }

    public void utilisateur_authentifie_a_publie_commentaire(String content) throws Exception {
        prepareAuthenticatedComment(content);
    }

    public void utilisateur_authentifie_a_publie_un_commentaire() throws Exception {
        prepareAuthenticatedComment("Commentaire publié pour le scénario");
    }

    public void utilisateur_authentifie_consulte_oeuvre_deposee() {
        // TODO: préparer la consultation de sa propre œuvre
    }

    public void utilisateur_authentifie_consulte_oeuvre_lui_meme_deposee() {
        // TODO: préparer la consultation de sa propre œuvre
    }

    @Given("un utilisateur authentifié consulte une œuvre qu'il n'a pas déposée")
    public void utilisateur_authentifie_consulte_oeuvre_non_deposee() {
        // TODO: préparer la consultation d'une œuvre tierce
    }

    public void utilisateur_authentifie_redige_commentaire_valide() {
        // TODO: préparer un commentaire valide
    }

    @Given("un autre utilisateur a publié un commentaire sur une œuvre appartenant à l'utilisateur authentifié")
    public void autre_utilisateur_a_publie_commentaire_sur_oeuvre_authentifie() {
        // TODO: préparer un commentaire tiers sur l'œuvre de l'utilisateur
    }

    @When("un autre utilisateur authentifié tente de modifier ce commentaire")
    public void autre_utilisateur_authentifie_tente_modifier_commentaire() throws Exception {
        authenticateAs(uniqueUsername("comment-third-party"), false);
        Integer commentId = requireScenarioCommentId();
        capture(mockMvc.perform(patch("/comments/{commentId}", commentId)
                .session(scenarioContext.getSession())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                        Map.of("content", "Tentative de modification non autorisée")))));
    }

    @When("un autre utilisateur authentifié, ni auteur ni administrateur, tente de supprimer ce commentaire")
    public void autre_utilisateur_non_auteur_non_administrateur_tente_supprimer_commentaire()
            throws Exception {
        authenticateAs(uniqueUsername("comment-third-party"), false);
        Integer commentId = requireScenarioCommentId();
        capture(mockMvc.perform(delete("/comments/{commentId}", commentId)
                .session(scenarioContext.getSession())));
    }

    private void submitRegistration() throws Exception {
        registrationUserExistedBeforeRequest = username != null && users.existsByUsername(username);
        Map<String, Object> request = new HashMap<>(form);
        if (username != null) request.put("username", username);
        if (email != null) request.put("email", email);
        if (password != null) request.put("password", password);
        capture(mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))));
    }

    private void login(String requestedUsername, String requestedPassword) throws Exception {
        Map<String, Object> requestBody = Map.of(
                "username", requestedUsername,
                "password", requestedPassword
        );
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andReturn();
        capture(result);
        if (responseStatus == 200) {
            assertInstanceOf(MockHttpSession.class, result.getRequest().getSession(false),
                "La connexion doit créer une session HTTP");
            session = (MockHttpSession) result.getRequest().getSession(false);
            scenarioContext.setSession(session);
            assertInstanceOf(SecurityContext.class,
                session.getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY),
                "La session doit contenir le contexte de sécurité");
            SecurityContext context = (SecurityContext) session.getAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
            assertNotNull(context.getAuthentication(), "Le contexte de session doit contenir une authentification");
            assertTrue(context.getAuthentication().isAuthenticated(),
                "L'authentification stockée en session doit être valide");
        }
    }

    private void changePassword() throws Exception {
        Map<String, Object> requestBody = new HashMap<>();
        if ("reset-password".equals(page)) {
            requestBody.put("token", resetToken == null ? "" : resetToken);
            requestBody.put("newPassword", newPassword == null ? "" : newPassword);
            requestBody.put("confirmPassword", form.getOrDefault("confirmPassword", newPassword == null ? "" : newPassword));
            var request = post("/auth/password/reset")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestBody));
            capture(mockMvc.perform(request));
            return;
        }

        requestBody.put("oldPassword", oldPassword == null ? "" : oldPassword);
        requestBody.put("newPassword", newPassword == null ? "" : newPassword);
        requestBody.put("confirmPassword", form.getOrDefault("confirmPassword", newPassword == null ? "" : newPassword));
        var request = post("/auth/password/change")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody));
        if (session != null) {
            request.session(session);
        }
        capture(mockMvc.perform(request));
    }

    private String createValidResetToken(String requestedUsername) {
        User user = users.findByUsername(requestedUsername)
                .orElseGet(() -> users.findByEmail(requestedUsername + "@example.com").orElseGet(() -> {
                    User created = new User();
                    created.setUsername(requestedUsername);
                    created.setEmail(requestedUsername + "@example.com");
                    created.setPasswordHash(passwordEncoder.encode("Password123!"));
                    created.setAdmin(false);
                    created.setCreatedAt(LocalDateTime.now());
                    return users.save(created);
                }));
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString().replace("-", ""));
        token.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        token.setUsed(false);
        passwordResetTokens.save(token);
        return token.getToken();
    }

    private void capture(ResultActions resultActions) throws Exception {
        capture(resultActions.andReturn());
    }

    private void capture(MvcResult result) throws Exception {
        responseStatus = result.getResponse().getStatus();
        responseBody = result.getResponse().getContentAsString();
        scenarioContext.setResponseStatus(responseStatus);
        scenarioContext.setResponseBody(responseBody);
    }

    public void authenticateAs(String requestedUsername, boolean administrator) throws Exception {
        username = requestedUsername;
        email = requestedUsername + "@example.com";
        password = "oldPassword!";
        oldPassword = password;
        scenarioContext.setUsername(username);
        scenarioContext.setAdministrator(administrator);
        saveAccount(username, email, password, administrator);
        login(username, password);
        assertEquals(200, responseStatus, "La connexion de préparation doit réussir");
    }

    private void prepareAuthenticatedComment(String content) throws Exception {
        authenticateAs(uniqueUsername("comment-author"), false);

        User author = users.findByUsername(scenarioContext.getUsername())
                .orElseThrow(() -> new AssertionError("L'auteur authentifié est introuvable"));
        User workOwner = saveAccountAndFindUser(uniqueUsername("comment-work-owner"));

        Oeuvre work = new Oeuvre();
        work.setTitle("Œuvre du commentaire " + UUID.randomUUID());
        work.setDescription("Œuvre préparée pour le test des permissions de commentaire");
        work.setAuthor(workOwner);
        work.setStatus(OeuvreStatus.approved);
        Oeuvre savedWork = oeuvres.save(work);

        Comment comment = new Comment();
        comment.setOeuvre(savedWork);
        comment.setUser(author);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());
        Comment savedComment = comments.save(comment);

        scenarioContext.setOeuvreId(savedWork.getOeuvreId());
        scenarioContext.setWorkTitle(savedWork.getTitle());
        scenarioContext.setCommentId(savedComment.getCommentId());
        scenarioContext.setCommentContent(savedComment.getContent());
    }

    private User saveAccountAndFindUser(String requestedUsername) {
        saveAccount(requestedUsername, requestedUsername + "@example.com", "oldPassword!");
        return users.findByUsername(requestedUsername)
                .orElseThrow(() -> new AssertionError("Le propriétaire de l'œuvre est introuvable"));
    }

    private Integer requireScenarioCommentId() {
        Integer commentId = scenarioContext.getCommentId();
        assertNotNull(commentId, "Le scénario doit préparer un commentaire avant l'action");
        return commentId;
    }

    private String uniqueUsername(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private void saveAccount(String requestedUsername, String requestedEmail, String requestedPassword) {
        saveAccount(requestedUsername, requestedEmail, requestedPassword, false);
    }

    private void saveAccount(String requestedUsername, String requestedEmail, String requestedPassword,
                             boolean administrator) {
        User user = users.findByUsername(requestedUsername).orElseGet(User::new);
        user.setUsername(requestedUsername);
        user.setEmail(requestedEmail);
        user.setPasswordHash(passwordEncoder.encode(requestedPassword));
        user.setAdmin(administrator);
        user.setCreatedAt(user.getCreatedAt() == null ? LocalDateTime.now() : user.getCreatedAt());
        users.save(user);
    }
}
