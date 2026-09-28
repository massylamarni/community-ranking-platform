package fr.numeronumber1.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.multipart.MultipartFile;

import fr.numeronumber1.dto.request.CreateOeuvreRequest;
import fr.numeronumber1.dto.request.SubmitOeuvreRequest;
import fr.numeronumber1.dto.request.UpdateOeuvreRequest;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.exception.UnauthorizedActionException;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.OeuvreCategory;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.CategoryRepository;
import fr.numeronumber1.repository.OeuvreCategoryRepository;
import fr.numeronumber1.repository.OeuvreRepository;

@ExtendWith(MockitoExtension.class)
class OeuvreServiceTest {

    @Mock
    private OeuvreRepository oeuvreRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private OeuvreCategoryRepository oeuvreCategoryRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private OeuvreService oeuvreService;

    private User author;
    private User otherUser;
    private User adminUser;
    private Oeuvre oeuvre;

    @BeforeEach
    void setUp() {
        author = new User();
        author.setUserId(1);
        author.setUsername("authorUser");
        author.setAdmin(false);

        otherUser = new User();
        otherUser.setUserId(2);
        otherUser.setUsername("otherUser");
        otherUser.setAdmin(false);

        adminUser = new User();
        adminUser.setUserId(3);
        adminUser.setUsername("adminUser");
        adminUser.setAdmin(true);

        oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(10L);
        oeuvre.setTitle("Mon Chef-d'œuvre");
        oeuvre.setDescription("Description de l'œuvre");
        oeuvre.setAuthor(author);
        oeuvre.setStatus(OeuvreStatus.created);
    }

    // --- getById ---

    @Test
    void getById_succes() {
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));

        Oeuvre result = oeuvreService.getById(10L);

        assertEquals("Mon Chef-d'œuvre", result.getTitle());
        assertEquals("Description de l'œuvre", result.getDescription());
        assertEquals("authorUser", result.getAuthor().getUsername());
    }

    @Test
    void getById_echoue_si_introuvable() {
        when(oeuvreRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> oeuvreService.getById(99L));
    }

    // --- create ---

    @Test
    void create_succes() {
        CreateOeuvreRequest req = new CreateOeuvreRequest();
        req.setTitle("Nouveau Titre");
        req.setDescription("Nouvelle Description");

        when(oeuvreRepository.existsByTitle("Nouveau Titre")).thenReturn(false);
        when(oeuvreRepository.save(any(Oeuvre.class))).thenAnswer(inv -> inv.getArgument(0));

        Oeuvre result = oeuvreService.create(req, author);

        assertEquals("Nouveau Titre", result.getTitle());
        assertEquals("Nouvelle Description", result.getDescription());
        assertEquals(author, result.getAuthor());
        verify(oeuvreRepository).save(any(Oeuvre.class));
    }

    @Test
    void create_echoue_si_titre_existant() {
        CreateOeuvreRequest req = new CreateOeuvreRequest();
        req.setTitle("Mon Chef-d'œuvre");

        when(oeuvreRepository.existsByTitle("Mon Chef-d'œuvre")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> oeuvreService.create(req, author));

        assertEquals("Une œuvre avec ce titre existe déjà", ex.getMessage());
        verify(oeuvreRepository, never()).save(any());
    }

    @Test
    void create_avec_image_file() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);

        CreateOeuvreRequest req = new CreateOeuvreRequest();
        req.setTitle("Œuvre avec Image");
        req.setImage(file);

        when(oeuvreRepository.existsByTitle("Œuvre avec Image")).thenReturn(false);
        when(fileStorageService.store(file, "works")).thenReturn("/uploads/works/image.jpg");
        when(oeuvreRepository.save(any(Oeuvre.class))).thenAnswer(inv -> inv.getArgument(0));

        Oeuvre result = oeuvreService.create(req, author);

        assertEquals("/uploads/works/image.jpg", result.getImageUrl());
    }

    // --- update ---

    @Test
    void update_succes_auteur_modifie_oeuvre() {
        UpdateOeuvreRequest req = new UpdateOeuvreRequest();
        req.setTitle("Nouveau Titre");
        req.setDescription("Nouvelle Description");

        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(oeuvreRepository.existsByTitleAndOeuvreIdNot("Nouveau Titre", 10L)).thenReturn(false);
        when(oeuvreRepository.save(any(Oeuvre.class))).thenAnswer(inv -> inv.getArgument(0));

        Oeuvre result = oeuvreService.update(10L, req, author);

        assertEquals("Nouveau Titre", result.getTitle());
        assertEquals("Nouvelle Description", result.getDescription());
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void update_echoue_si_pas_auteur() {
        UpdateOeuvreRequest req = new UpdateOeuvreRequest();
        req.setTitle("Titre modifié");

        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));

        UnauthorizedActionException ex = assertThrows(UnauthorizedActionException.class,
                () -> oeuvreService.update(10L, req, otherUser));

        assertEquals("Vous n'êtes pas l'auteur de cette œuvre", ex.getMessage());
        verify(oeuvreRepository, never()).save(any());
    }

    @Test
    void update_echoue_si_oeuvre_pending() {
        oeuvre.setStatus(OeuvreStatus.pending);
        UpdateOeuvreRequest req = new UpdateOeuvreRequest();
        req.setTitle("Titre modifié");

        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> oeuvreService.update(10L, req, author));

        assertEquals("Cette œuvre ne peut pas être modifiée dans son état actuel", ex.getMessage());
    }

    @Test
    void update_proposition_refusee_remet_status_created() {
        oeuvre.setStatus(OeuvreStatus.rejected);
        UpdateOeuvreRequest req = new UpdateOeuvreRequest();
        req.setTitle("Titre corrigé");

        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(oeuvreRepository.existsByTitleAndOeuvreIdNot("Titre corrigé", 10L)).thenReturn(false);
        when(oeuvreRepository.save(any(Oeuvre.class))).thenAnswer(inv -> inv.getArgument(0));

        Oeuvre result = oeuvreService.update(10L, req, author);

        assertEquals(OeuvreStatus.created, result.getStatus());
        assertEquals("Titre corrigé", result.getTitle());
    }

    @Test
    void update_echoue_si_introuvable() {
        UpdateOeuvreRequest req = new UpdateOeuvreRequest();
        when(oeuvreRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> oeuvreService.update(99L, req, author));
    }

    @Test
    void update_echoue_si_titre_duplique() {
        UpdateOeuvreRequest req = new UpdateOeuvreRequest();
        req.setTitle("Titre existant");

        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(oeuvreRepository.existsByTitleAndOeuvreIdNot("Titre existant", 10L)).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> oeuvreService.update(10L, req, author));

        assertEquals("Une œuvre avec ce titre existe déjà", ex.getMessage());
    }

    // --- uploadImage ---

    @Test
    void uploadImage_succes() {
        MultipartFile file = mock(MultipartFile.class);
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(fileStorageService.store(file, "works")).thenReturn("/uploads/works/new.jpg");
        when(oeuvreRepository.save(any(Oeuvre.class))).thenAnswer(inv -> inv.getArgument(0));

        Oeuvre result = oeuvreService.uploadImage(10L, file, author);

        assertEquals("/uploads/works/new.jpg", result.getImageUrl());
    }

    @Test
    void uploadImage_echoue_si_pas_auteur() {
        MultipartFile file = mock(MultipartFile.class);
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> oeuvreService.uploadImage(10L, file, otherUser));

        assertEquals("Vous n'êtes pas l'auteur de cette œuvre", ex.getMessage());
        verify(fileStorageService, never()).store(any(), any());
    }

    @Test
    void uploadImage_echoue_si_introuvable() {
        MultipartFile file = mock(MultipartFile.class);
        when(oeuvreRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> oeuvreService.uploadImage(99L, file, author));
    }

    // --- submit ---

    @Test
    void submit_succes() {
        SubmitOeuvreRequest req = new SubmitOeuvreRequest();
        req.setCategoryIds(List.of(1, 2));

        Category cat1 = new Category();
        cat1.setCategoryId(1);
        Category cat2 = new Category();
        cat2.setCategoryId(2);

        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(categoryRepository.findAllById(List.of(1, 2))).thenReturn(List.of(cat1, cat2));
        when(oeuvreRepository.save(any(Oeuvre.class))).thenAnswer(inv -> inv.getArgument(0));

        Oeuvre result = oeuvreService.submit(10L, req, author);

        assertEquals(OeuvreStatus.pending, result.getStatus());
        verify(oeuvreCategoryRepository, org.mockito.Mockito.times(2)).save(any(OeuvreCategory.class));
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void submit_echoue_si_pas_auteur() {
        SubmitOeuvreRequest req = new SubmitOeuvreRequest();
        req.setCategoryIds(List.of(1));

        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> oeuvreService.submit(10L, req, otherUser));

        assertEquals("Vous n'êtes pas l'auteur de cette œuvre", ex.getMessage());
    }

    @Test
    void submit_echoue_si_deja_soumise() {
        oeuvre.setStatus(OeuvreStatus.pending);
        SubmitOeuvreRequest req = new SubmitOeuvreRequest();
        req.setCategoryIds(List.of(1));

        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> oeuvreService.submit(10L, req, author));

        assertEquals("Cette œuvre a déjà été soumise", ex.getMessage());
    }

    @Test
    void submit_echoue_si_categorie_introuvable() {
        SubmitOeuvreRequest req = new SubmitOeuvreRequest();
        req.setCategoryIds(List.of(1, 999));

        Category cat1 = new Category();
        cat1.setCategoryId(1);

        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(categoryRepository.findAllById(List.of(1, 999))).thenReturn(List.of(cat1)); // retourne 1 seule cat

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> oeuvreService.submit(10L, req, author));

        assertEquals("Une ou plusieurs catégories sont introuvables", ex.getMessage());
    }

    // --- resoumettre proposition refusee ---

    @Test
    void update_puis_submit_proposition_refusee() {
        oeuvre.setStatus(OeuvreStatus.rejected);

        // etape 1 : modifier la proposition refusee
        UpdateOeuvreRequest updateReq = new UpdateOeuvreRequest();
        updateReq.setTitle("Titre corrigé");
        updateReq.setDescription("Description corrigée");

        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(oeuvreRepository.existsByTitleAndOeuvreIdNot("Titre corrigé", 10L)).thenReturn(false);
        when(oeuvreRepository.save(any(Oeuvre.class))).thenAnswer(inv -> inv.getArgument(0));

        Oeuvre updated = oeuvreService.update(10L, updateReq, author);
        assertEquals(OeuvreStatus.created, updated.getStatus());

        // etape 2 : resoumettre
        SubmitOeuvreRequest submitReq = new SubmitOeuvreRequest();
        submitReq.setCategoryIds(List.of(1));

        Category cat1 = new Category();
        cat1.setCategoryId(1);
        when(categoryRepository.findAllById(List.of(1))).thenReturn(List.of(cat1));

        Oeuvre resubmitted = oeuvreService.submit(10L, submitReq, author);
        assertEquals(OeuvreStatus.pending, resubmitted.getStatus());
    }

    // --- delete ---

    @Test
    void delete_succes_auteur_supprime_sa_propre_oeuvre() {
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));

        oeuvreService.delete(10L, author);

        verify(oeuvreRepository).delete(oeuvre);
    }

    @Test
    void delete_succes_administrateur_supprime_oeuvre() {
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));

        oeuvreService.delete(10L, adminUser);

        verify(oeuvreRepository).delete(oeuvre);
    }

    @Test
    void delete_echoue_utilisateur_tente_supprimer_oeuvre_autre_utilisateur() {
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));

        UnauthorizedActionException ex = assertThrows(UnauthorizedActionException.class,
                () -> oeuvreService.delete(10L, otherUser));

        assertEquals("Vous n'êtes pas autorisé à supprimer cette œuvre", ex.getMessage());
        verify(oeuvreRepository, never()).delete(any(Oeuvre.class));
    }

    @Test
    void delete_echoue_si_oeuvre_introuvable() {
        when(oeuvreRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> oeuvreService.delete(99L, author));

        verify(oeuvreRepository, never()).delete(any(Oeuvre.class));
    }

    // --- admin create ---

    @Test
    void create_succes_par_administrateur_statut_approved() {
        CreateOeuvreRequest req = new CreateOeuvreRequest();
        req.setTitle("Œuvre par Admin");
        req.setDescription("Description Admin");

        when(oeuvreRepository.existsByTitle("Œuvre par Admin")).thenReturn(false);
        when(oeuvreRepository.save(any(Oeuvre.class))).thenAnswer(inv -> inv.getArgument(0));

        Oeuvre result = oeuvreService.create(req, adminUser);

        assertEquals("Œuvre par Admin", result.getTitle());
        assertEquals("Description Admin", result.getDescription());
        assertEquals(adminUser, result.getAuthor());
        assertEquals(OeuvreStatus.approved, result.getStatus());
        verify(oeuvreRepository).save(any(Oeuvre.class));
    }

    // --- getAll ---

    @Test
    void getAll_succes_avec_filtres() {
        when(oeuvreRepository.findAll(any(Specification.class))).thenReturn(List.of(oeuvre));

        List<Oeuvre> result = oeuvreService.getAll(OeuvreStatus.approved, 1, "Chef");

        assertEquals(1, result.size());
        assertEquals("Mon Chef-d'œuvre", result.get(0).getTitle());
        verify(oeuvreRepository).findAll(any(Specification.class));
    }
}
