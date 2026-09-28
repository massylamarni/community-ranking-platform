package fr.numeronumber1.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class NotificationSteps {

    @Given("un utilisateur a soumis une œuvre")
    public void utilisateur_a_soumis_oeuvre() {
        // TODO: préparer une œuvre soumise
    }

    @Then("l'utilisateur est informé que son œuvre a été acceptée")
    public void utilisateur_informe_acceptation_oeuvre() {
        // TODO: vérifier la notification d'acceptation
    }

    @Then("l'utilisateur est informé que son œuvre a été refusée")
    public void utilisateur_informe_refus_oeuvre() {
        // TODO: vérifier la notification de refus
    }

    @Given("un utilisateur possède un compte actif")
    public void utilisateur_possede_compte_actif() {
        // TODO: préparer un compte utilisateur actif
    }

    @When("un administrateur bloque son compte")
    public void administrateur_bloque_compte() {
        // TODO: préparer le blocage du compte
    }

    @Then("l'utilisateur est informé que son compte a été bloqué")
    public void utilisateur_informe_blocage_compte() {
        // TODO: vérifier la notification de blocage
    }

    @When("un administrateur supprime son compte")
    public void administrateur_supprime_compte() {
        // TODO: préparer la suppression du compte
    }

    @Then("l'utilisateur est informé que son compte a été supprimé")
    public void utilisateur_informe_suppression_compte() {
        // TODO: vérifier la notification de suppression
    }

    @Given("un utilisateur possède un contenu")
    public void utilisateur_possede_contenu() {
        // TODO: préparer un contenu utilisateur
    }

    @When("un administrateur réalise une action affectant ce contenu")
    public void administrateur_realise_action_sur_contenu() {
        // TODO: préparer une action affectant le contenu
    }

    @Then("l'utilisateur est informé de l'action réalisée")
    public void utilisateur_informe_action_realisee() {
        // TODO: vérifier la notification de l'action
    }
}
