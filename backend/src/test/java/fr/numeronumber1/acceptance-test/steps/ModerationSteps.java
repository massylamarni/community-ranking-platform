package fr.numeronumber1.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class ModerationSteps {

    @Given("l'œuvre {string} est en attente de modération")
    public void oeuvre_en_attente_moderation(String title) {
        // TODO: préparer une œuvre en attente de modération
    }

    @Given("l'œuvre est en attente de modération")
    public void oeuvre_est_en_attente_moderation() {
        // TODO: préparer une œuvre en attente de modération
    }

    @Given("l'œuvre appartient à la catégorie {string}")
    public void oeuvre_appartient_a_categorie(String categoryName) {
        // TODO: préparer la catégorie de l'œuvre
    }

    @When("l'administrateur accepte l'œuvre")
    @When("un administrateur accepte l'œuvre")
    public void administrateur_accepte_oeuvre() {
        // TODO: préparer l'acceptation de l'œuvre
    }

    @Then("l'œuvre est publiée")
    public void oeuvre_est_publiee() {
        // TODO: vérifier la publication après modération
    }

    @Then("son statut est {string}")
    public void statut_oeuvre_est(String status) {
        // TODO: vérifier le statut de l'œuvre
    }

    @When("l'administrateur refuse l'œuvre")
    @When("un administrateur refuse l'œuvre")
    public void administrateur_refuse_oeuvre() {
        // TODO: préparer le refus de l'œuvre
    }

    @Then("le statut de {string} devient {string}")
    public void statut_oeuvre_devient(String title, String status) {
        // TODO: vérifier le changement de statut
    }

    @Then("{string} apparaît dans la liste des œuvres de la catégorie {string}")
    public void oeuvre_apparait_dans_liste_categorie(String title, String categoryName) {
        // TODO: vérifier la présence de l'œuvre dans la catégorie
    }

    @Then("l'œuvre peut être consultée par les utilisateurs")
    public void oeuvre_consultable_par_utilisateurs() {
        // TODO: vérifier que l'œuvre peut être consultée
    }

    @Then("{string} n'apparaît pas dans les œuvres publiques")
    public void oeuvre_absente_des_oeuvres_publiques(String title) {
        // TODO: vérifier que l'œuvre n'est pas visible publiquement
    }

    @Then("l'auteur de {string} est informé du refus")
    public void auteur_informe_du_refus(String title) {
        // TODO: vérifier l'information de l'auteur
    }

    @Given("l'utilisateur a proposé l'œuvre {string}")
    public void utilisateur_a_propose_oeuvre(String title) {
        // TODO: préparer une œuvre proposée
    }

    @Given("la proposition a été refusée")
    public void proposition_a_ete_refusee() {
        // TODO: préparer une proposition refusée
    }

    @When("utilisateur modifie la description de l'œuvre")
    public void utilisateur_modifie_description_oeuvre() {
        // TODO: préparer la modification de description
    }

    @When("il remplace la description par {string}")
    public void remplace_description_oeuvre(String description) {
        // TODO: préparer la nouvelle description
    }

    @When("il soumet à nouveau l'œuvre")
    public void soumet_oeuvre_a_nouveau() {
        // TODO: préparer une nouvelle soumission
    }

    @Then("la nouvelle proposition est enregistrée")
    public void nouvelle_proposition_enregistree() {
        // TODO: vérifier l'enregistrement de la proposition
    }

    @Then("la proposition est envoyée au filtrage automatique")
    public void proposition_envoyee_au_filtrage() {
        // TODO: vérifier l'envoi au filtrage automatique
    }
}
