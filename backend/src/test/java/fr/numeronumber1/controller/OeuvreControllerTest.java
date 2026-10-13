package fr.numeronumber1.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import fr.numeronumber1.dto.request.CreateOeuvreRequest;
import fr.numeronumber1.dto.request.SubmitOeuvreRequest;
import fr.numeronumber1.dto.request.UpdateOeuvreRequest;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.exception.UnauthorizedActionException;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.OeuvreCategory;
import fr.numeronumber1.model.OeuvreCategoryId;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.service.AuthService;
import fr.numeronumber1.service.OeuvreService;
import fr.numeronumber1.service.PasswordService;
import fr.numeronumber1.service.UserService;

@SpringBootTest
public class OeuvreControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @MockitoBean
    private OeuvreService oeuvreService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private PasswordService passwordService;

    @MockitoBean
    private JavaMailSender mailSender;

    private User alice;
    private User bob;
    private User admin;
    private Oeuvre oeuvre;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        alice = new User();
        alice.setUserId(1);
        alice.setUsername("alice");
        alice.setAdmin(false);

        bob = new User();
        bob.setUserId(2);
        bob.setUsername("bob");
        bob.setAdmin(false);

        admin = new User();
        admin.setUserId(3);
        admin.setUsername("admin");
        admin.setAdmin(true);

        oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(10L);
        oeuvre.setTitle("Mon Oeuvre");
        oeuvre.setDescription("Ma Description");
        oeuvre.setAuthor(alice);
        oeuvre.setStatus(OeuvreStatus.created);
        oeuvre.setOeuvreCategories(new ArrayList<>());
        oeuvre.setVotes(new ArrayList<>());
    }

    // --- GET /works/{id} ---

    @Test
    void getById_oeuvre_publiee_retourne_200() throws Exception {
        oeuvre.setStatus(OeuvreStatus.approved);

        // ajouter des categories
        Category cat = new Category();
        cat.setCategoryId(1);
        cat.setName("Peinture");
        OeuvreCategory oc = new OeuvreCategory();
        oc.setId(new OeuvreCategoryId(10L, 1));
        oc.setOeuvre(oeuvre);
        oc.setCategory(cat);
        oeuvre.setOeuvreCategories(List.of(oc));

        // ajouter des votes
        Vote v1 = new Vote();
        v1.setVoteId(1);
        Vote v2 = new Vote();
        v2.setVoteId(2);
        oeuvre.setVotes(List.of(v1, v2));

        when(oeuvreService.getById(10L)).thenReturn(oeuvre);

        mockMvc.perform(get("/works/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.title").value("Mon Oeuvre"))
                .andExpect(jsonPath("$.description").value("Ma Description"))
                .andExpect(jsonPath("$.author").value("alice"))
                .andExpect(jsonPath("$.categories[0]").value("Peinture"))
                .andExpect(jsonPath("$.totalVotes").value(2));
    }

    @Test
    void getById_oeuvre_introuvable_retourne_404() throws Exception {
        when(oeuvreService.getById(99L))
                .thenThrow(new ResourceNotFoundException("Œuvre introuvable"));

        mockMvc.perform(get("/works/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Œuvre introuvable"));
    }

    // --- POST /works ---

    @Test
    @WithMockUser(username = "alice")
    void createJson_succes_retourne_201() throws Exception {
        when(userService.findByUsername("alice")).thenReturn(alice);
        when(oeuvreService.create(any(CreateOeuvreRequest.class), eq(alice))).thenReturn(oeuvre);

        mockMvc.perform(post("/works")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Mon Oeuvre\", \"description\": \"Ma Description\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("10"))
                .andExpect(jsonPath("$.title").value("Mon Oeuvre"))
                .andExpect(jsonPath("$.status").value("created"));
    }

    @Test
    @WithMockUser(username = "alice")
    void createJson_sans_titre_retourne_422() throws Exception {
        mockMvc.perform(post("/works")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\": \"Seulement description\"}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.fields.title").exists());
    }

    @Test
    void createJson_non_authentifie_retourne_401() throws Exception {
        mockMvc.perform(post("/works")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Mon Oeuvre\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @WithMockUser(username = "alice")
    void createJson_titre_existant_retourne_400() throws Exception {
        when(userService.findByUsername("alice")).thenReturn(alice);
        when(oeuvreService.create(any(CreateOeuvreRequest.class), eq(alice)))
                .thenThrow(new IllegalArgumentException("Une œuvre avec ce titre existe déjà"));

        mockMvc.perform(post("/works")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Mon Oeuvre\", \"description\": \"Ma description\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Une œuvre avec ce titre existe déjà"));
    }

    // --- POST /works/{id}/submit ---

    @Test
    @WithMockUser(username = "alice")
    void submit_succes_retourne_200() throws Exception {
        oeuvre.setStatus(OeuvreStatus.pending);
        when(userService.findByUsername("alice")).thenReturn(alice);
        when(oeuvreService.submit(eq(10L), any(SubmitOeuvreRequest.class), eq(alice))).thenReturn(oeuvre);

        mockMvc.perform(post("/works/10/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryIds\": [1, 2]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("10"))
                .andExpect(jsonPath("$.status").value("pending"));
    }

    @Test
    @WithMockUser(username = "alice")
    void submit_sans_categories_retourne_422() throws Exception {
        mockMvc.perform(post("/works/10/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryIds\": []}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.status").value(422))
                .andExpect(jsonPath("$.fields.categoryIds").exists());
    }

    // --- PATCH /works/{id} ---

    @Test
    @WithMockUser(username = "alice")
    void update_succes_retourne_200() throws Exception {
        oeuvre.setTitle("Titre modifié");
        oeuvre.setDescription("Description modifiée");
        when(userService.findByUsername("alice")).thenReturn(alice);
        when(oeuvreService.update(eq(10L), any(UpdateOeuvreRequest.class), eq(alice))).thenReturn(oeuvre);

        mockMvc.perform(patch("/works/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Titre modifié\", \"description\": \"Description modifiée\", "
                                + "\"categoryIds\": [1, 4]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Titre modifié"))
                .andExpect(jsonPath("$.description").value("Description modifiée"));

        ArgumentCaptor<UpdateOeuvreRequest> request = ArgumentCaptor.forClass(UpdateOeuvreRequest.class);
        verify(oeuvreService).update(eq(10L), request.capture(), eq(alice));
        assertEquals(List.of(1, 4), request.getValue().getCategoryIds());
    }

    @Test
    @WithMockUser(username = "bob")
    void update_pas_auteur_retourne_403() throws Exception {
        when(userService.findByUsername("bob")).thenReturn(bob);
        when(oeuvreService.update(eq(10L), any(UpdateOeuvreRequest.class), eq(bob)))
                .thenThrow(new UnauthorizedActionException("Vous n'êtes pas l'auteur de cette œuvre"));

        mockMvc.perform(patch("/works/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Titre modifié\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Vous n'êtes pas l'auteur de cette œuvre"));
    }

    @Test
    void update_non_authentifie_retourne_401() throws Exception {
        mockMvc.perform(patch("/works/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Titre modifié\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @WithMockUser(username = "alice")
    void update_proposition_refusee_retourne_200() throws Exception {
        oeuvre.setStatus(OeuvreStatus.created); // apres modif, status redevient created
        oeuvre.setTitle("Titre corrigé");
        when(userService.findByUsername("alice")).thenReturn(alice);
        when(oeuvreService.update(eq(10L), any(UpdateOeuvreRequest.class), eq(alice))).thenReturn(oeuvre);

        mockMvc.perform(patch("/works/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Titre corrigé\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("created"))
                .andExpect(jsonPath("$.title").value("Titre corrigé"));
    }

    // --- DELETE /works/{id} ---

    @Test
    @WithMockUser(username = "alice")
    void delete_auteur_supprime_sa_propre_oeuvre_retourne_204() throws Exception {
        when(userService.findByUsername("alice")).thenReturn(alice);
        doNothing().when(oeuvreService).delete(10L, alice);

        mockMvc.perform(delete("/works/10"))
                .andExpect(status().isNoContent());

        verify(oeuvreService).delete(10L, alice);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void delete_administrateur_supprime_oeuvre_retourne_204() throws Exception {
        when(userService.findByUsername("admin")).thenReturn(admin);
        doNothing().when(oeuvreService).delete(10L, admin);

        mockMvc.perform(delete("/works/10"))
                .andExpect(status().isNoContent());

        verify(oeuvreService).delete(10L, admin);
    }

    @Test
    @WithMockUser(username = "bob")
    void delete_autre_utilisateur_refuse_retourne_403() throws Exception {
        when(userService.findByUsername("bob")).thenReturn(bob);
        doThrow(new UnauthorizedActionException("Vous n'êtes pas autorisé à supprimer cette œuvre"))
                .when(oeuvreService).delete(10L, bob);

        mockMvc.perform(delete("/works/10"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Vous n'êtes pas autorisé à supprimer cette œuvre"));
    }

    @Test
    void delete_non_authentifie_retourne_401() throws Exception {
        mockMvc.perform(delete("/works/10"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @WithMockUser(username = "alice")
    void delete_oeuvre_introuvable_retourne_404() throws Exception {
        when(userService.findByUsername("alice")).thenReturn(alice);
        doThrow(new ResourceNotFoundException("Œuvre introuvable"))
                .when(oeuvreService).delete(99L, alice);

        mockMvc.perform(delete("/works/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Œuvre introuvable"));
    }

    // --- Admin Create via POST /works ---

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void createJson_administrateur_cree_oeuvre_statut_approved_retourne_201() throws Exception {
        Oeuvre adminOeuvre = new Oeuvre();
        adminOeuvre.setOeuvreId(20L);
        adminOeuvre.setTitle("Œuvre Admin");
        adminOeuvre.setDescription("Description Admin");
        adminOeuvre.setAuthor(admin);
        adminOeuvre.setStatus(OeuvreStatus.approved);
        adminOeuvre.setOeuvreCategories(new ArrayList<>());
        adminOeuvre.setVotes(new ArrayList<>());

        when(userService.findByUsername("admin")).thenReturn(admin);
        when(oeuvreService.create(any(CreateOeuvreRequest.class), eq(admin))).thenReturn(adminOeuvre);

        mockMvc.perform(post("/works")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\": \"Œuvre Admin\", \"description\": \"Description Admin\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("20"))
                .andExpect(jsonPath("$.title").value("Œuvre Admin"))
                .andExpect(jsonPath("$.author").value("admin"))
                .andExpect(jsonPath("$.status").value("approved"));
    }

    // --- GET /works ---

    @Test
    void getAll_succes_retourne_liste_oeuvres() throws Exception {
        when(oeuvreService.getAll(any(), any(), any()))
                .thenReturn(List.of(oeuvre));

        mockMvc.perform(get("/works")
                        .param("status", "created")
                        .param("title", "Mon"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].title").value("Mon Oeuvre"))
                .andExpect(jsonPath("$[0].author").value("alice"));
    }
}
