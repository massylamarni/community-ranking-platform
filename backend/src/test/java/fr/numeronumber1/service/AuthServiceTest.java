package fr.numeronumber1.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import fr.numeronumber1.dto.request.RegisterRequest;
import fr.numeronumber1.exception.EmailAlreadyExistsException;
import fr.numeronumber1.exception.UsernameAlreadyExistsException;
import fr.numeronumber1.model.User;
import fr.numeronumber1.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("alice");
        registerRequest.setEmail("alice@test.com");
        registerRequest.setPassword("motdepasse123");
    }

    @Test
    void register_devrait_creer_un_utilisateur() {
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.existsByEmail("alice@test.com")).thenReturn(false);
        when(passwordEncoder.encode("motdepasse123")).thenReturn("hash123");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setUserId(1);
            return u;
        });

        User result = authService.register(registerRequest);

        assertNotNull(result);
        assertEquals("alice", result.getUsername());
        assertEquals("alice@test.com", result.getEmail());
        assertEquals("hash123", result.getPasswordHash());
        assertFalse(result.isAdmin());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_echoue_si_username_deja_pris() {
        when(userRepository.existsByUsername("alice")).thenReturn(true);

        UsernameAlreadyExistsException ex = assertThrows(
                UsernameAlreadyExistsException.class,
                () -> authService.register(registerRequest)
        );
        assertEquals("Nom d'utilisateur déjà enregistré", ex.getMessage());
    }

    @Test
    void register_echoue_si_email_deja_pris() {
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.existsByEmail("alice@test.com")).thenReturn(true);

        EmailAlreadyExistsException ex = assertThrows(
                EmailAlreadyExistsException.class,
                () -> authService.register(registerRequest)
        );
        assertEquals("Email déjà enregistré", ex.getMessage());
    }

    @Test
    void authenticate_delegue_au_manager() {
        Authentication expected = new UsernamePasswordAuthenticationToken("alice", "motdepasse123");
        when(authenticationManager.authenticate(any())).thenReturn(expected);

        Authentication result = authService.authenticate("alice", "motdepasse123");

        assertEquals(expected, result);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }
}
