package fr.numeronumber1.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @Size(min = 2, max = 30, message = "Le nom d'utilisateur doit contenir entre 2 et 30 caractères")
    private String username;

    @Email(message = "L'adresse e-mail est invalide")
    private String email;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
