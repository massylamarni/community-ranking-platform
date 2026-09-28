package fr.numeronumber1.dto.request;

import jakarta.validation.constraints.NotBlank;

public class RefuseWork {

    @NotBlank(message = "La raison du refus est obligatoire")
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}