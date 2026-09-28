package fr.numeronumber1.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class OeuvreSteps {

    @Given("une œuvre existe")
    public void oeuvre_existe() {
        // TODO: préparer une œuvre existante
    }

    @Given("une œuvre existante")
    public void oeuvre_existante() {
        // TODO: préparer une œuvre existante
    }

    @Then("l'œuvre est créée")
    public void oeuvre_est_creee() {
        // TODO: vérifier la création de l'œuvre
    }

    @Then("l'œuvre est supprimée")
    public void oeuvre_est_supprimee() {
        // TODO: vérifier la suppression de l'œuvre
    }

    @Then("l'œuvre n'est pas publiée")
    public void oeuvre_n_est_pas_publiee() {
        // TODO: vérifier que l'œuvre n'a pas été publiée
    }

    @Then("l'œuvre est créée avec le titre {string}")
    public void oeuvre_creee_avec_titre(String title) {
        // TODO: vérifier le titre de l'œuvre créée
    }

    @When("elle ne saisit aucun titre")
    public void elle_ne_saisit_aucun_titre() {
        // TODO: représenter un titre absent
    }

    @When("elle renseigne les autres informations obligatoires")
    public void elle_renseigne_autres_informations_obligatoires() {
        // TODO: préparer les autres informations obligatoires
    }

    @Then("un message indique que le titre est obligatoire")
    public void message_titre_obligatoire() {
        // TODO: vérifier le message de titre obligatoire
    }

    @Then("sa description est {string}")
    public void description_oeuvre_est(String description) {
        // TODO: vérifier la description de l'œuvre
    }

    @When("elle ne saisit aucune description")
    public void elle_ne_saisit_aucune_description() {
        // TODO: représenter une description absente
    }

    @Then("un message indique que la description est obligatoire")
    public void message_description_obligatoire() {
        // TODO: vérifier le message de description obligatoire
    }

    @Given("les informations obligatoires de l'œuvre sont renseignées")
    public void informations_obligatoires_renseignees() {
        // TODO: préparer les informations obligatoires de l'œuvre
    }

    @When("il associe l'image {string} à l'œuvre")
    public void associe_image_a_oeuvre(String imageName) {
        // TODO: préparer l'image de l'œuvre
    }

    @When("il ne sélectionne aucune image")
    public void ne_selectionne_aucune_image() {
        // TODO: représenter l'absence d'image sélectionnée
    }

    @Then("l'image {string} est associée à l'œuvre")
    public void image_est_associee_a_oeuvre(String imageName) {
        // TODO: vérifier l'association de l'image
    }

    @Then("aucune image n'est associée à l'œuvre")
    public void aucune_image_associee_a_oeuvre() {
        // TODO: vérifier l'absence d'image associée
    }

    @Given("une proposition de cet utilisateur qui a été refusée")
    public void proposition_utilisateur_refusee() {
        // TODO: préparer une proposition refusée
    }

    @When("l'utilisateur propose une œuvre dans cette catégorie")
    public void utilisateur_propose_oeuvre_dans_categorie() {
        // TODO: préparer une proposition d'œuvre
    }

    @When("l'utilisateur tente de proposer une œuvre")
    public void utilisateur_tente_de_proposer_oeuvre() {
        // TODO: préparer une tentative de proposition d'œuvre
    }

    @Then("la proposition de l'œuvre est enregistrée")
    public void proposition_oeuvre_enregistree() {
        // TODO: vérifier l'enregistrement de la proposition
    }

    @Then("l'œuvre est associée à la catégorie sélectionnée")
    public void oeuvre_associee_a_categorie_selectionnee() {
        // TODO: vérifier l'association à la catégorie sélectionnée
    }

    @Then("la proposition de l'œuvre est refusée")
    public void proposition_oeuvre_refusee() {
        // TODO: vérifier le refus de la proposition
    }

    @When("l'utilisateur modifie la proposition")
    public void utilisateur_modifie_proposition() {
        // TODO: préparer la modification de la proposition
    }

    @Then("la proposition est modifiée")
    public void proposition_est_modifiee() {
        // TODO: vérifier la modification de la proposition
    }

    @When("l'utilisateur soumet à nouveau la proposition")
    public void utilisateur_soumet_proposition_a_nouveau() {
        // TODO: préparer une nouvelle soumission de proposition
    }

    @Then("la proposition est soumise à nouveau")
    public void proposition_est_soumise_a_nouveau() {
        // TODO: vérifier la nouvelle soumission
    }

    @Given("une œuvre créée par cet utilisateur")
    public void oeuvre_creee_par_utilisateur() {
        // TODO: préparer une œuvre de l'utilisateur
    }

    @Given("une œuvre créée par un autre utilisateur")
    public void oeuvre_creee_par_autre_utilisateur() {
        // TODO: préparer une œuvre d'un autre utilisateur
    }

    @When("l'utilisateur modifie l'œuvre")
    public void utilisateur_modifie_oeuvre() {
        // TODO: préparer la modification de l'œuvre
    }

    @Given("l'auteur modifie l'œuvre")
    public void auteur_modifie_oeuvre() {
        // TODO: préparer la modification de l'œuvre par son auteur
    }

    @Then("les modifications sont enregistrées")
    public void modifications_oeuvre_enregistrees() {
        // TODO: vérifier l'enregistrement des modifications
    }

    @When("l'utilisateur tente de modifier l'œuvre")
    public void utilisateur_tente_modifier_oeuvre() {
        // TODO: représenter la tentative de modification
    }

    @Then("la modification est refusée")
    public void modification_oeuvre_refusee() {
        // TODO: vérifier le refus de modification
    }

    @Then("l'œuvre modifiée est soumise à nouveau au processus de filtrage")
    public void oeuvre_modifiee_soumise_au_filtrage() {
        // TODO: vérifier la nouvelle soumission au filtrage
    }

    @When("l'utilisateur supprime l'œuvre")
    public void utilisateur_supprime_oeuvre() {
        // TODO: préparer la suppression de l'œuvre
    }

    @When("l'utilisateur tente de supprimer l'œuvre")
    public void utilisateur_tente_de_supprimer_oeuvre() {
        // TODO: préparer une tentative de suppression d'œuvre
    }

    @Then("la suppression est refusée")
    public void suppression_oeuvre_refusee() {
        // TODO: vérifier le refus de suppression
    }

    @Given("une œuvre publiée")
    public void oeuvre_publiee() {
        // TODO: préparer une œuvre publiée
    }

    @When("un visiteur consulte l'œuvre")
    public void visiteur_consulte_oeuvre() {
        // TODO: préparer la consultation publique de l'œuvre
    }

    @Then("les informations de l'œuvre sont affichées")
    public void informations_oeuvre_affichees() {
        // TODO: vérifier les informations affichées
    }

    @Given("l'œuvre possède des votes")
    public void oeuvre_possede_votes() {
        // TODO: préparer les votes de l'œuvre
    }

    @When("un utilisateur consulte l'œuvre")
    public void utilisateur_consulte_oeuvre() {
        // TODO: préparer la consultation de l'œuvre
    }

    @Then("le nombre total de votes de l'œuvre est affiché")
    public void nombre_total_votes_affiche() {
        // TODO: vérifier le nombre total de votes affiché
    }

    @Given("des commentaires sont associés à cette œuvre")
    public void commentaires_associes_a_oeuvre() {
        // TODO: préparer les commentaires de l'œuvre
    }

    @Then("les commentaires associés à l'œuvre sont affichés")
    public void commentaires_associes_affiches() {
        // TODO: vérifier l'affichage des commentaires
    }
}
