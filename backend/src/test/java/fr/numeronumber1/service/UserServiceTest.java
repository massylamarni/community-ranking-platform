package fr.numeronumber1.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

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
}
