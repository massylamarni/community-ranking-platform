package fr.numeronumber1.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordRequest {

    @NotBlank(message = "L'adresse e-mail est requise")
    @Email(message = "L'adresse e-mail est invalide")
    private String email;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
