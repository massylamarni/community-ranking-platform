package fr.numeronumber1.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VoteRequest {

    @NotBlank(message = "Le type de vote est obligatoire")
    @Pattern(
            regexp = "positive|negative",
            message = "Le type de vote doit être 'positive' ou 'negative'"
    )
    private String type;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}