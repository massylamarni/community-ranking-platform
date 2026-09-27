package fr.numeronumber1.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import fr.numeronumber1.service.AuthService;
import fr.numeronumber1.service.PasswordService;
import fr.numeronumber1.service.UserService;

@SpringBootTest
public class PasswordControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private PasswordService passwordService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JavaMailSender mailSender;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    // --- /auth/password/change ---

    @Test
    @WithMockUser(username = "alice")
    void changePassword_authentifie_retourne_204() throws Exception {
        mockMvc.perform(post("/auth/password/change")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"oldPassword\": \"old12345\", \"newPassword\": \"new12345\", \"confirmPassword\": \"new12345\"}"))
                .andExpect(status().isNoContent());

        verify(passwordService).changePassword("alice", "old12345", "new12345", "new12345");
    }

    @Test
    void changePassword_non_authentifie_retourne_401() throws Exception {
        mockMvc.perform(post("/auth/password/change")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"oldPassword\": \"old12345\", \"newPassword\": \"new12345\", \"confirmPassword\": \"new12345\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Non authentifié"));
    }

    @Test
    @WithMockUser(username = "alice")
    void changePassword_confirmation_differente_retourne_400() throws Exception {
        doThrow(new IllegalArgumentException("Les mots de passe ne correspondent pas"))
                .when(passwordService).changePassword("alice", "old12345", "new12345", "wrong12345");

        mockMvc.perform(post("/auth/password/change")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"oldPassword\": \"old12345\", \"newPassword\": \"new12345\", \"confirmPassword\": \"wrong12345\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Les mots de passe ne correspondent pas"));
    }

    // --- /auth/password/forgot ---

    @Test
    void forgotPassword_succes_retourne_202() throws Exception {
        mockMvc.perform(post("/auth/password/forgot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"alice@test.com\"}"))
                .andExpect(status().isAccepted());

        verify(passwordService).forgotPassword("alice@test.com");
    }

    @Test
    void forgotPassword_email_invalide_retourne_422() throws Exception {
        mockMvc.perform(post("/auth/password/forgot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"invalid-email\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422));
    }

    // --- /auth/password/reset ---

    @Test
    void resetPassword_succes_retourne_204() throws Exception {
        mockMvc.perform(post("/auth/password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\": \"validToken123\", \"newPassword\": \"new12345\", \"confirmPassword\": \"new12345\"}"))
                .andExpect(status().isNoContent());

        verify(passwordService).resetPassword("validToken123", "new12345", "new12345");
    }

    @Test
    void resetPassword_token_invalide_retourne_400() throws Exception {
        doThrow(new IllegalArgumentException("Token invalide ou expiré"))
                .when(passwordService).resetPassword("invalidToken", "new12345", "new12345");

        mockMvc.perform(post("/auth/password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\": \"invalidToken\", \"newPassword\": \"new12345\", \"confirmPassword\": \"new12345\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Token invalide ou expiré"));
    }
}
