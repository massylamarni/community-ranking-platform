package fr.numeronumber1.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import fr.numeronumber1.model.User;
import fr.numeronumber1.repository.UserRepository;

@SpringBootTest
public class ProfileAndAuthMeTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    private User regularUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        regularUser = new User();
        regularUser.setUserId(1);
        regularUser.setUsername("alice");
        regularUser.setEmail("alice@example.com");
        regularUser.setPasswordHash("hash");
        regularUser.setAdmin(false);

        adminUser = new User();
        adminUser.setUserId(2);
        adminUser.setUsername("adminUser");
        adminUser.setEmail("admin@example.com");
        adminUser.setPasswordHash("hash");
        adminUser.setAdmin(true);

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(regularUser));
        when(userRepository.findByUsername("adminUser")).thenReturn(Optional.of(adminUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    // --- /auth/me tests ---

    @Test
    void unauthenticatedCallToMeReturns401() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Non authentifié"));
    }

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void authenticatedUserCanGetMe() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("1"))
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.role").value("user"));
    }

    @Test
    @WithMockUser(username = "adminUser", roles = {"ADMIN"})
    void authenticatedAdminCanGetMeWithAdminRole() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("2"))
                .andExpect(jsonPath("$.username").value("adminUser"))
                .andExpect(jsonPath("$.role").value("admin"));
    }

    // --- /profile tests ---

    @Test
    void unauthenticatedCallToProfileReturns401() throws Exception {
        mockMvc.perform(get("/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Non authentifié"));
    }

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void authenticatedUserCanGetOwnProfile() throws Exception {
        mockMvc.perform(get("/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("1"))
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.email").value("alice@example.com"))
                .andExpect(jsonPath("$.role").value("user"));
    }

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void userCanUpdateOwnUsername() throws Exception {
        when(userRepository.existsByUsername("alice_new")).thenReturn(false);

        mockMvc.perform(patch("/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\": \"alice_new\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("alice_new"))
                .andExpect(jsonPath("$.email").value("alice@example.com"));
    }

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void updateProfileWithShortUsernameReturns422() throws Exception {
        mockMvc.perform(patch("/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\": \"a\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.error").value("Échec de la validation"))
                .andExpect(jsonPath("$.fields.username").exists());
    }

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void updateProfileWithTakenUsernameReturns409() throws Exception {
        when(userRepository.existsByUsername("taken_user")).thenReturn(true);

        mockMvc.perform(patch("/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\": \"taken_user\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Nom d'utilisateur déjà enregistré"));
    }
}
