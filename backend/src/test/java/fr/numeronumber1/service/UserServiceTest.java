package fr.numeronumber1.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import fr.numeronumber1.dto.response.PublicProfileResponse;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.repository.CommentRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.VoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import fr.numeronumber1.exception.EmailAlreadyExistsException;
import fr.numeronumber1.exception.UsernameAlreadyExistsException;
import fr.numeronumber1.model.User;
import fr.numeronumber1.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OeuvreRepository oeuvreRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private VoteRepository voteRepository;

    @InjectMocks
    private UserService userService;

    private User alice;
    private User admin;

    @BeforeEach
    void setUp() {
        alice = new User();
        alice.setUserId(1);
        alice.setUsername("alice");
        alice.setEmail("alice@test.com");
        alice.setPasswordHash("hash");
        alice.setAdmin(false);

        admin = new User();
        admin.setUserId(2);
        admin.setUsername("adminUser");
        admin.setEmail("admin@test.com");
        admin.setPasswordHash("hash");
        admin.setAdmin(true);
    }

    // --- findByUsername ---

    @Test
    void findByUsername_retourne_le_user() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));

        User result = userService.findByUsername("alice");

        assertEquals("alice", result.getUsername());
        assertEquals("alice@test.com", result.getEmail());
    }

    @Test
    void findByUsername_lance_exception_si_introuvable() {
        when(userRepository.findByUsername("inconnu")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userService.findByUsername("inconnu"));
    }

    // --- loadUserByUsername ---

    @Test
    void loadUserByUsername_retourne_role_user() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));

        UserDetails details = userService.loadUserByUsername("alice");

        assertEquals("alice", details.getUsername());
        assertTrue(details.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
    }

    @Test
    void loadUserByUsername_retourne_role_admin_pour_admin() {
        when(userRepository.findByUsername("adminUser")).thenReturn(Optional.of(admin));

        UserDetails details = userService.loadUserByUsername("adminUser");

        assertTrue(details.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        assertTrue(details.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
    }

    // --- updateProfile ---

    @Test
    void updateProfile_met_a_jour_username_et_email() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));
        when(userRepository.existsByUsername("alice2")).thenReturn(false);
        when(userRepository.existsByEmail("alice2@test.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.updateProfile("alice", "alice2", "alice2@test.com");

        assertEquals("alice2", result.getUsername());
        assertEquals("alice2@test.com", result.getEmail());
    }

    @Test
    void updateProfile_garde_les_anciens_si_champs_vides() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.updateProfile("alice", "", "");

        assertEquals("alice", result.getUsername());
        assertEquals("alice@test.com", result.getEmail());
    }

    @Test
    void updateProfile_echoue_si_username_pris() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));
        when(userRepository.existsByUsername("bob")).thenReturn(true);

        assertThrows(UsernameAlreadyExistsException.class,
                () -> userService.updateProfile("alice", "bob", null));
    }

    @Test
    void updateProfile_echoue_si_email_pris() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));
        when(userRepository.existsByEmail("bob@test.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class,
                () -> userService.updateProfile("alice", null, "bob@test.com"));
    }

    @Test
    void getPublicProfile_retourne_le_profil_public() {
        when(userRepository.findById(1))
                .thenReturn(Optional.of(alice));

        when(commentRepository.findByUserUserIdOrderByCreatedAtDesc(1))
                .thenReturn(List.of());

        when(voteRepository.findByUserUserId(1))
                .thenReturn(List.of());

        PublicProfileResponse result =
                userService.getPublicProfile(1);

        assertNotNull(result);
        assertEquals(1, result.userId());
        assertEquals("alice", result.username());

        assertNotNull(result.publishedWorks());
        assertNotNull(result.comments());
        assertNotNull(result.votedWorks());

        assertTrue(result.publishedWorks().isEmpty());
        assertTrue(result.comments().isEmpty());
        assertTrue(result.votedWorks().isEmpty());
    }

    @Test
    void getPublicProfile_lance_exception_si_utilisateur_introuvable() {
        when(userRepository.findById(999))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> userService.getPublicProfile(999)
        );
    }

    @Test
    void getPublicProfile_ne_retourne_pas_email_ni_mot_de_passe() {
        when(userRepository.findById(1))
                .thenReturn(Optional.of(alice));

        when(commentRepository.findByUserUserIdOrderByCreatedAtDesc(1))
                .thenReturn(List.of());

        when(voteRepository.findByUserUserId(1))
                .thenReturn(List.of());

        PublicProfileResponse result =
                userService.getPublicProfile(1);

        assertNotNull(result);
        assertEquals("alice", result.username());

        assertFalse(result.toString().contains("alice@test.com"));
        assertFalse(result.toString().contains("passwordHash"));
        assertFalse(result.toString().contains("hash"));
    }

}
