package fr.numeronumber1.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class CommentSteps {

    @Given("{string} a publié le commentaire {string} sur {string}")
    public void utilisateur_a_publie_commentaire_sur_oeuvre(String username, String comment, String title) {
        // TODO: préparer le commentaire publié
    }

    @When("l'administrateur supprime le commentaire")
    public void administrateur_supprime_commentaire() {
        // TODO: implémenter la suppression administrative du commentaire
    }

    @Then("le commentaire n'est plus visible sur {string}")
    public void commentaire_n_est_plus_visible_sur_oeuvre(String title) {
        // TODO: vérifier que le commentaire n'est plus visible sur l'œuvre
    }

    @Then("le commentaire n'est plus visible sur le profil de {string}")
    public void commentaire_n_est_plus_visible_sur_profil(String username) {
        // TODO: vérifier que le commentaire n'est plus visible sur le profil
    }

    @When("il rédige le commentaire {string}")
    public void redige_commentaire(String comment) {
        // TODO: préparer le texte du commentaire
    }

    @When("il valide la publication")
    public void valide_publication_commentaire() {
        // TODO: préparer la publication du commentaire
    }

    @Then("le commentaire {string} est enregistré")
    public void commentaire_est_enregistre(String comment) {
        // TODO: vérifier l'enregistrement du commentaire
    }

    @Then("il est affiché sous l'œuvre concernée avec son auteur")
    public void commentaire_affiche_avec_auteur() {
        // TODO: vérifier l'affichage du commentaire et de son auteur
    }

    @When("il tente de publier le commentaire {string}")
    public void tente_publier_commentaire(String comment) {
        // TODO: préparer la tentative de publication
    }

    @Then("le système l'empêche de publier le commentaire")
    public void systeme_empeche_publication_commentaire() {
        // TODO: vérifier le refus de publication
    }

    @Then("le commentaire n'est pas enregistré")
    public void commentaire_n_est_pas_enregistre() {
        // TODO: vérifier que le commentaire n'a pas été enregistré
    }

    @Then("un message indique qu'il doit être connecté pour commenter")
    public void message_connexion_requise_pour_commenter() {
        // TODO: vérifier le message indiquant la connexion requise
    }

    @When("il modifie ce commentaire en {string}")
    public void modifie_commentaire(String updatedComment) {
        // TODO: préparer la modification du commentaire
    }

    @When("il valide la modification")
    public void valide_modification_commentaire() {
        // TODO: préparer la validation de la modification
    }

    @Then("le commentaire affiché sous l'œuvre est {string}")
    public void commentaire_affiche_est(String expectedComment) {
        // TODO: vérifier le texte du commentaire affiché
    }

    @Given("un commentaire est publié sous une œuvre")
    public void commentaire_publie_sous_oeuvre() {
        // TODO: préparer un commentaire publié
    }

    @When("un administrateur supprime ce commentaire")
    public void administrateur_supprime_ce_commentaire() {
        // TODO: préparer la suppression du commentaire
    }

    @Then("le commentaire n'est plus affiché sous l'œuvre")
    public void commentaire_n_est_plus_affiche_sous_oeuvre() {
        // TODO: vérifier que le commentaire n'est plus affiché
    }

    @Then("le commentaire n'est plus affiché sous l'œuvre concernée")
    public void commentaire_n_est_plus_affiche_sous_oeuvre_concernee() {
        // TODO: vérifier que le commentaire modéré n'est plus affiché
    }

    @Given("l'utilisateur {string} publie un commentaire sous une œuvre")
    public void utilisateur_publie_commentaire(String username) {
        // TODO: préparer la publication du commentaire
    }

    @When("l'œuvre est consultée")
    public void oeuvre_est_consultee() {
        // TODO: préparer la consultation de l'œuvre
    }

    @When("il supprime ce commentaire")
    public void il_supprime_ce_commentaire() {
        // TODO: préparer la suppression du commentaire
    }

    @Then("le commentaire affiché indique {string} comme auteur")
    public void commentaire_indique_auteur(String author) {
        // TODO: vérifier l'auteur affiché
    }

    @When("il associe une image à ce commentaire")
    public void associe_image_au_commentaire() {
        // TODO: préparer l'image du commentaire
    }

    @When("il tente de publier un commentaire principal sur cette œuvre")
    public void tente_publier_commentaire_principal() {
        // TODO: préparer la tentative de commentaire principal
    }

    @Then("l'action est refusée par le système")
    public void action_refusee_par_systeme() {
        // TODO: vérifier le refus de l'action
    }

    @Then("un message indique qu'il ne peut pas commenter sa propre œuvre")
    public void message_commentaire_sur_propre_oeuvre_interdit() {
        // TODO: vérifier le message de refus sur sa propre œuvre
    }

    @Then("le commentaire est publié avec l'image associée")
    public void commentaire_publie_avec_image() {
        // TODO: vérifier la publication du commentaire avec image
    }

    @When("l'auteur de l'œuvre répond à ce commentaire")
    public void auteur_repond_au_commentaire() {
        // TODO: préparer la réponse au commentaire
    }

    @Then("la réponse est enregistrée")
    public void reponse_est_enregistree() {
        // TODO: vérifier l'enregistrement de la réponse
    }

    @Then("elle est affichée sous l'œuvre concernée")
    public void reponse_affichee_sous_oeuvre() {
        // TODO: vérifier l'affichage de la réponse
    }

    @Given("l'œuvre {string} a reçu {int} commentaires publiés")
    public void oeuvre_a_recu_commentaires(String title, int commentCount) {
        // TODO: préparer les commentaires publiés de l'œuvre
    }

    @When("cette œuvre est consultée")
    public void cette_oeuvre_est_consultee() {
        // TODO: préparer la consultation de l'œuvre
    }

    @Then("les {int} commentaires sont affichés sous l'œuvre")
    public void commentaires_affiches_sous_oeuvre(int commentCount) {
        // TODO: vérifier le nombre de commentaires affichés
    }

    @Given("un commentaire publié ne respecte pas les règles définies par le site")
    public void commentaire_ne_respecte_pas_regles() {
        // TODO: préparer un commentaire à modérer
    }

    @When("un administrateur consulte ce commentaire")
    public void administrateur_consulte_commentaire() {
        // TODO: préparer la consultation administrative du commentaire
    }

    @When("il le supprime dans le cadre de la modération")
    public void supprime_commentaire_pour_moderation() {
        // TODO: préparer la suppression de modération
    }

    @When("un utilisateur non administrateur tente de le supprimer au titre de la modération")
    public void utilisateur_non_admin_tente_suppression_moderation() {
        // TODO: préparer une tentative de suppression non autorisée
    }
}
