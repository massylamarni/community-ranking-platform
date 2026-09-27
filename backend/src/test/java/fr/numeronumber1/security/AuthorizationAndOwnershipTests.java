package fr.numeronumber1.security;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import fr.numeronumber1.model.Comment;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.repository.CommentRepository;
import fr.numeronumber1.repository.OeuvreRepository;

@SpringBootTest
public class AuthorizationAndOwnershipTests {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private OeuvreRepository oeuvreRepository;

    @MockitoBean
    private CommentRepository commentRepository;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        User author = new User();
        author.setUserId(1);
        author.setUsername("alice");
        author.setAdmin(false);

        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(10L);
        oeuvre.setTitle("Œuvre de test");
        oeuvre.setAuthor(author);

        Comment comment = new Comment();
        comment.setCommentId(20);
        comment.setContent("Commentaire de test");
        comment.setUser(author);
        comment.setOeuvre(oeuvre);

        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(commentRepository.findById(20)).thenReturn(Optional.of(comment));
    }

    // --- 1. Visitor (unauthenticated) checks ---

    @Test
    void visitorCanAccessPublicEndpoint() throws Exception {
        mockMvc.perform(get("/test-security/public"))
                .andExpect(status().isOk())
                .andExpect(content().string("public-ok"));
    }

    @Test
    void visitorDeniedOnAuthenticatedEndpointReturns401() throws Exception {
        mockMvc.perform(get("/test-security/authenticated"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Non authentifié"));
    }

    @Test
    void visitorDeniedOnAdminEndpointReturns401() throws Exception {
        mockMvc.perform(get("/test-security/admin"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Non authentifié"));
    }

    // --- 2. Authenticated user and role checks ---

    @Test
    @WithMockUser(username = "bob", roles = {"USER"})
    void authenticatedUserCanAccessProtectedEndpoint() throws Exception {
        mockMvc.perform(get("/test-security/authenticated"))
                .andExpect(status().isOk())
                .andExpect(content().string("authenticated-ok"));
    }

    @Test
    @WithMockUser(username = "bob", roles = {"USER"})
    void userForbiddenOnAdminEndpointReturns403() throws Exception {
        mockMvc.perform(get("/test-security/admin"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Droits insuffisants pour effectuer cette action"));
    }

    @Test
    @WithMockUser(username = "adminUser", roles = {"ADMIN"})
    void adminCanAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/test-security/admin"))
                .andExpect(status().isOk())
                .andExpect(content().string("admin-ok"));
    }

    // --- 3. Ownership: Author-only actions ---

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void authorCanEditWork() throws Exception {
        mockMvc.perform(patch("/test-security/works/10"))
                .andExpect(status().isOk())
                .andExpect(content().string("work-edited"));
    }

    @Test
    @WithMockUser(username = "bob", roles = {"USER"})
    void nonAuthorCannotEditWork() throws Exception {
        mockMvc.perform(patch("/test-security/works/10"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Droits insuffisants pour effectuer cette action"));
    }

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void authorCanEditComment() throws Exception {
        mockMvc.perform(patch("/test-security/comments/20"))
                .andExpect(status().isOk())
                .andExpect(content().string("comment-edited"));
    }

    @Test
    @WithMockUser(username = "bob", roles = {"USER"})
    void nonAuthorCannotEditComment() throws Exception {
        mockMvc.perform(patch("/test-security/comments/20"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Droits insuffisants pour effectuer cette action"));
    }

    // --- 4. Ownership: Author or Admin actions ---

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void authorCanDeleteWork() throws Exception {
        mockMvc.perform(delete("/test-security/works/10"))
                .andExpect(status().isOk())
                .andExpect(content().string("work-deleted"));
    }

    @Test
    @WithMockUser(username = "adminUser", roles = {"ADMIN"})
    void adminCanDeleteWork() throws Exception {
        mockMvc.perform(delete("/test-security/works/10"))
                .andExpect(status().isOk())
                .andExpect(content().string("work-deleted"));
    }

    @Test
    @WithMockUser(username = "bob", roles = {"USER"})
    void nonAuthorNonAdminCannotDeleteWork() throws Exception {
        mockMvc.perform(delete("/test-security/works/10"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Droits insuffisants pour effectuer cette action"));
    }

    // --- 5. Business rules: voting & comments on own work ---

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void authorCannotVoteOnOwnWork() throws Exception {
        mockMvc.perform(post("/test-security/works/10/vote"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Impossible de voter pour sa propre œuvre"));
    }

    @Test
    @WithMockUser(username = "bob", roles = {"USER"})
    void nonAuthorCanVoteOnWork() throws Exception {
        mockMvc.perform(post("/test-security/works/10/vote"))
                .andExpect(status().isOk())
                .andExpect(content().string("voted-ok"));
    }

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void authorCannotPostMainCommentOnOwnWork() throws Exception {
        mockMvc.perform(post("/test-security/works/10/comments"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Impossible d'ajouter un commentaire principal sur sa propre œuvre"));
    }

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void authorCanReplyToCommentOnOwnWork() throws Exception {
        mockMvc.perform(post("/test-security/works/10/comments").param("parentCommentId", "20"))
                .andExpect(status().isOk())
                .andExpect(content().string("comment-created-ok"));
    }

    @Test
    @WithMockUser(username = "alice", roles = {"USER"})
    void nonExistentResourceReturns404() throws Exception {
        when(oeuvreRepository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/test-security/works/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Œuvre introuvable : 999"));
    }
}
