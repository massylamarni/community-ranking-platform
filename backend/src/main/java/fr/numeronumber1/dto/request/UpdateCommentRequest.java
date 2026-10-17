package fr.numeronumber1.dto.request;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;

public class UpdateCommentRequest {
    @NotBlank(message = "Le contenu du commentaire ne peut pas être vide")
    private String content;

    private MultipartFile image;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }
}
