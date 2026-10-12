package fr.numeronumber1.dto.request;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateOeuvreRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 150, message = "Le titre ne peut pas dépasser 150 caractères")
    private String title;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @Size(max = 255, message = "L'URL de l'image ne peut pas dépasser 255 caractères")
    private String imageUrl;

    private MultipartFile image;

    private List<Integer> categoryIds;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public MultipartFile getImage() { return image; }
    public void setImage(MultipartFile image) { this.image = image; }

    public List<Integer> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<Integer> categoryIds) { this.categoryIds = categoryIds; }
}
