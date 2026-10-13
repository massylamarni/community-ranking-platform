package fr.numeronumber1.steps;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class RankingSteps {

    @Given("les œuvres publiées suivantes existent dans des catégories différentes :")
    @Given("les œuvres publiées suivantes existent :")
    public void oeuvres_publiees_existent(DataTable table) {
        // TODO: préparer les œuvres publiées du classement
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
        // TODO: préparer le vote positif du jour
    }

    @Given("l'œuvre {string} a reçu un vote positif hier, hors de la période du jour en cours")
    public void oeuvre_a_recu_vote_positif_hier(String title) {
        // TODO: préparer le vote positif de la veille
    }

    @When("l'utilisateur consulte le classement {string}")
    public void utilisateur_consulte_classement_periode(String period) {
        // TODO: préparer la consultation du classement périodique
    }

    @Then("le vote d'aujourd'hui sur {string} est comptabilisé dans ce classement")
    public void vote_aujourd_hui_comptabilise(String title) {
        // TODO: vérifier la prise en compte du vote du jour
    }

    @Then("le vote d'hier sur {string} n'est pas comptabilisé dans ce classement")
    public void vote_hier_non_comptabilise(String title) {
        // TODO: vérifier l'exclusion du vote de la veille
    }

    @Given("l'œuvre {string} a reçu un vote positif au cours de la semaine en cours")
    public void oeuvre_a_recu_vote_semaine_courante(String title) {
        // TODO: préparer le vote de la semaine courante
    }

    @Given("l'œuvre {string} a reçu un vote positif la semaine précédente")
    public void oeuvre_a_recu_vote_semaine_precedente(String title) {
        // TODO: préparer le vote de la semaine précédente
    }

    @Then("le vote de {string} est comptabilisé dans ce classement")
    public void vote_est_comptabilise(String title) {
        // TODO: vérifier la prise en compte du vote
    }

    @Then("le vote de {string} datant de la semaine précédente n'est pas comptabilisé dans ce classement")
    public void vote_semaine_precedente_non_comptabilise(String title) {
        // TODO: vérifier l'exclusion du vote de la semaine précédente
    }

    @Given("l'œuvre {string} a reçu un vote positif au cours du mois en cours")
    public void oeuvre_a_recu_vote_mois_courant(String title) {
        // TODO: préparer le vote du mois courant
    }

    @Given("l'œuvre {string} a reçu un vote positif le mois précédent")
    public void oeuvre_a_recu_vote_mois_precedent(String title) {
        // TODO: préparer le vote du mois précédent
    }

    @Then("le vote de {string} datant du mois précédent n'est pas comptabilisé dans ce classement")
    public void vote_mois_precedent_non_comptabilise(String title) {
        // TODO: vérifier l'exclusion du vote du mois précédent
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
        // TODO: préparer le classement hebdomadaire archivé
    }

    @When("l'utilisateur accède à la section des classements précédents")
    public void utilisateur_accede_anciens_classements() {
        // TODO: préparer l'accès aux classements précédents
    }

    @When("il sélectionne la semaine précédente")
    public void selectionne_semaine_precedente() {
        // TODO: préparer la sélection de la semaine précédente
    }

    @Then("le classement affiché est exactement {string}, {string}, {string}")
    public void classement_affiche_est_exact(String firstTitle, String secondTitle, String thirdTitle) {
        // TODO: vérifier l'ordre du classement affiché
    }

    @Given("l'utilisateur consulte le classement global comportant des œuvres de plusieurs catégories")
    public void classement_global_multi_categories() {
        // TODO: préparer le classement global multi-catégories
    }

    @When("il sélectionne le filtre {string}")
    public void selectionne_filtre_classement(String filter) {
        // TODO: préparer la sélection du filtre
    }

    @When("il valide le filtre")
    public void valide_filtre_classement() {
        // TODO: préparer la validation du filtre
    }

    @Then("seules les œuvres de la catégorie {string} restent affichées")
    public void seules_oeuvres_categorie_affichees(String categoryName) {
        // TODO: vérifier le filtrage par catégorie
    }

    @Then("elles restent triées par score")
    public void oeuvres_restent_triees_par_score() {
        // TODO: vérifier le tri par score
    }

    @Given("l'utilisateur consulte le classement avec la période {string} sélectionnée")
    public void classement_consulte_avec_periode(String period) {
        // TODO: préparer le classement sur la période sélectionnée
    }

    @When("il sélectionne la période {string}")
    public void selectionne_periode_classement(String period) {
        // TODO: préparer la sélection de la période
    }

    @When("il valide ce choix")
    public void valide_choix_periode() {
        // TODO: préparer la validation de la période
    }

    @Then("le classement affiché est recalculé pour refléter uniquement les votes du mois en cours")
    public void classement_recalcule_pour_mois_courant() {
        // TODO: vérifier le recalcul du classement mensuel
    }
}
