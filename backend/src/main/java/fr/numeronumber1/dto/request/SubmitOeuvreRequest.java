package fr.numeronumber1.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public class SubmitOeuvreRequest {

    @NotEmpty(message = "Veuillez choisir au moins une catégorie")
    private List<Integer> categoryIds;

    public List<Integer> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<Integer> categoryIds) { this.categoryIds = categoryIds; }
}
