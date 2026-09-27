package fr.numeronumber1.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

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

import fr.numeronumber1.dto.request.CreateOeuvreRequest;
import fr.numeronumber1.dto.request.SubmitOeuvreRequest;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
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

        oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(10L);
        oeuvre.setTitle("Mon Oeuvre");
        oeuvre.setDescription("Ma Description");
        oeuvre.setAuthor(alice);
        oeuvre.setStatus(OeuvreStatus.created);
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
}
