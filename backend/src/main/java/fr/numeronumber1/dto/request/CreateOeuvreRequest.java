package fr.numeronumber1.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateOeuvreRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 150, message = "Le titre ne peut pas dépasser 150 caractères")
    private String title;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
