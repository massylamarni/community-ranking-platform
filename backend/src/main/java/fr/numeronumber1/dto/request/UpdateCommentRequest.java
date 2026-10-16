package fr.numeronumber1.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UpdateCommentRequest {
    @NotBlank(message = "Le contenu du commentaire ne peut pas être vide")
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
