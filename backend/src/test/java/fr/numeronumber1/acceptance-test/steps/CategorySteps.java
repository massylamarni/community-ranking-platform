package fr.numeronumber1.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import fr.numeronumber1.steps.AuthSteps;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Autowired;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.repository.CategoryRepository;

public class CategorySteps {

    @Autowired
    private CategoryRepository categories;

    @Autowired
    private AcceptanceScenarioContext scenarioContext;

    @Autowired
    private AuthSteps authSteps;

    @Given("la catégorie {string} n'existe pas")
    public void categorie_n_existe_pas(String categoryName) {
        // TODO: préparer une catégorie absente
    }

    @When("l'administrateur crée la catégorie {string}")
    public void administrateur_cree_categorie(String categoryName) {
        // TODO: implémenter la création de catégorie
    }

    @Then("la catégorie {string} est créée")
    public void categorie_est_creee(String categoryName) {
        // TODO: vérifier la création de catégorie
    }

    @Then("elle peut être utilisée pour déposer une œuvre")
    public void categorie_utilisable_pour_depot() {
        // TODO: vérifier que la catégorie est utilisable
    }

    @When("l'administrateur supprime la catégorie")
    public void administrateur_supprime_categorie() {
        // TODO: implémenter la suppression de catégorie
    }

    @Then("la catégorie {string} n'existe plus")
    public void categorie_n_existe_plus(String categoryName) {
        // TODO: vérifier la suppression de catégorie
    }

    @Then("elle ne peut plus être sélectionnée pour une nouvelle œuvre")
    public void categorie_indisponible_pour_nouvelle_oeuvre() {
        // TODO: vérifier que la catégorie ne peut plus être sélectionnée
    }

    @When("il saisit le nom de catégorie {string}")
    public void saisit_nom_categorie(String categoryName) {
        // TODO: préparer le nom de catégorie
    }

    @When("il valide la création")
    public void valide_creation_categorie() throws Exception {
        if (scenarioContext.getWorkTitle() != null || scenarioContext.getWorkDescription() != null) {
            authSteps.elle_valide_creation_oeuvre();
        }
    }

    @Then("elle apparaît dans la liste des catégories")
    public void categorie_apparait_dans_liste() {
        // TODO: vérifier l'affichage de la catégorie
    }

    @When("il tente de créer la catégorie {string}")
    public void tente_creer_categorie(String categoryName) {
        // TODO: représenter la tentative de création
    }

    @Then("la catégorie n'est pas créée")
    public void categorie_n_est_pas_creee() {
        // TODO: vérifier que la catégorie n'a pas été créée
    }

    @When("un utilisateur consulte la catégorie {string}")
    public void utilisateur_consulte_categorie(String categoryName) {
        // TODO: implémenter la consultation de catégorie
    }

    @Given("les œuvres {string} et {string} appartiennent à cette catégorie")
    public void oeuvres_appartiennent_a_categorie(String firstTitle, String secondTitle) {
        // TODO: préparer les œuvres de la catégorie
    }

    @Given("l'œuvre {string} appartient à la catégorie {string}")
    public void oeuvre_appartient_a_categorie(String title, String categoryName) {
        // TODO: associer une œuvre à une catégorie
    }

    @Then("{string} est affichée")
    public void oeuvre_est_affichee(String title) {
        // TODO: vérifier l'affichage de l'œuvre
    }

    @Then("{string} n'est pas affichée")
    public void oeuvre_n_est_pas_affichee(String title) {
        // TODO: vérifier l'absence de l'œuvre
    }

    @Given("aucune œuvre n'est associée à la catégorie {string}")
    public void aucune_oeuvre_associee_a_categorie(String categoryName) {
        // TODO: préparer une catégorie sans œuvre
    }

    @Then("aucune œuvre n'est affichée")
    public void aucune_oeuvre_n_est_affichee() {
        // TODO: vérifier l'absence d'œuvres affichées
    }

    @Then("un message indique qu'aucune œuvre n'est disponible")
    public void message_aucune_oeuvre_disponible() {
        // TODO: vérifier le message d'absence de contenu
    }

    @When("elle crée l'œuvre {string}")
    public void elle_cree_oeuvre(String title) {
        // TODO: préparer la création de l'œuvre
    }

    @When("elle renseigne {string} comme catégorie")
    public void elle_renseigne_categorie(String categoryName) {
        // TODO: sélectionner la catégorie de l'œuvre
    }

    @When("elle publie l'œuvre")
    public void elle_publie_oeuvre() {
        // TODO: implémenter la publication de l'œuvre
    }

    @Then("l'œuvre {string} est publiée")
    public void oeuvre_est_publiee(String title) {
        // TODO: vérifier la publication de l'œuvre
    }

    @When("elle ne sélectionne aucune catégorie")
    public void elle_ne_selectionne_aucune_categorie() {
        // TODO: représenter l'absence de catégorie sélectionnée
    }

    @When("elle tente de publier l'œuvre")
    public void elle_tente_publier_oeuvre() {
        // TODO: représenter la tentative de publication
    }

    @Then("un message indique qu'une catégorie est obligatoire")
    public void message_categorie_obligatoire() {
        // TODO: vérifier le message de catégorie obligatoire
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
