package fr.numeronumber1.dto.request;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class CreateCommentRequest {
    @NotBlank(message = "Le contenu du commentaire ne peut pas être vide")
    private String content;

    @Positive(message = "L'identifiant du commentaire parent doit être positif")
    private Integer parentCommentId;

    private MultipartFile image;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Integer parentCommentId) {
        this.parentCommentId = parentCommentId;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }
}
