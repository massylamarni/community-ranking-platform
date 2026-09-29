package fr.numeronumber1.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class PublicProfileSteps {

    @Given("l'utilisateur {string} possède un profil public")
    public void utilisateur_possede_profil_public(String username) {
        // TODO: préparer un profil public
    }

    @When("un autre utilisateur consulte ce profil")
    public void autre_utilisateur_consulte_profil() {
        // TODO: préparer la consultation du profil public
    }

    @Then("le profil de {string} s'affiche avec succès")
    public void profil_affiche_avec_succes(String username) {
        // TODO: vérifier l'affichage du profil public
    }

    @When("ce profil est consulté")
    public void profil_est_consulte() {
        // TODO: préparer la consultation du profil
    }

    @Then("le pseudo {string} est affiché sur la page")
    public void pseudo_est_affiche_sur_page(String username) {
        // TODO: vérifier le pseudo affiché
    }

    @Given("l'utilisateur {string} a publié {int} œuvres, {int} commentaire, et voté positivement pour {int} œuvres")
    public void utilisateur_a_activite_publique(String username, int workCount, int commentCount, int positiveVoteCount) {
        // TODO: préparer l'activité publique de l'utilisateur
    }

    @When("son profil public est consulté")
    public void profil_public_est_consulte() {
        // TODO: préparer la consultation du profil public
    }

    @Then("ses {int} œuvres publiées sont affichées sur son profil")
    public void oeuvres_publiees_affichees_sur_profil(int workCount) {
        // TODO: vérifier les œuvres publiées sur le profil
    }

    @Then("son commentaire est affiché sur son profil")
    public void commentaire_affiche_sur_profil() {
        // TODO: vérifier le commentaire sur le profil
    }

    @Then("les {int} œuvres qu'elle a votées positivement sont affichées comme favoris sur son profil")
    public void oeuvres_votees_affichees_comme_favoris(int workCount) {
        // TODO: vérifier les œuvres favorites sur le profil
    }

    @Given("un utilisateur possède une adresse e-mail")
    public void utilisateur_possede_email() {
        // TODO: préparer un utilisateur ayant une adresse e-mail
    }

    @When("un autre utilisateur consulte son profil public")
    public void autre_utilisateur_consulte_profil_public() {
        // TODO: préparer la consultation du profil par un autre utilisateur
    }

    @Then("l'adresse e-mail de l'utilisateur n'est pas affichée")
    public void email_utilisateur_non_affiche() {
        // TODO: vérifier que l'adresse e-mail reste privée
    }
}
