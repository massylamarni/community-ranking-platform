package fr.numeronumber1.dto.request;

import java.util.List;

import jakarta.validation.constraints.Size;

public class UpdateOeuvreRequest {

    @Size(max = 150, message = "Le titre ne peut pas dépasser 150 caractères")
    private String title;

    private String description;

    private List<Integer> categoryIds;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<Integer> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<Integer> categoryIds) { this.categoryIds = categoryIds; }
}
