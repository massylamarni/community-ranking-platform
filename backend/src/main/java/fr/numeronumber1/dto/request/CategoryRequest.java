package fr.numeronumber1.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryRequest {

    @NotBlank(message = "Le nom de la catégorie est obligatoire")
    @Size(max = 50, message = "Le nom de la catégorie ne doit pas dépasser 50 caractères")
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}