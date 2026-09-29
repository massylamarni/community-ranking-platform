package fr.numeronumber1.dto.request;

import jakarta.validation.constraints.Size;

public class UpdateOeuvreRequest {

    @Size(max = 150, message = "Le titre ne peut pas dépasser 150 caractères")
    private String title;

    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
