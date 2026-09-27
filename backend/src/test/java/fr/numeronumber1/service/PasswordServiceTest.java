package fr.numeronumber1.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;

import fr.numeronumber1.model.PasswordResetToken;
import fr.numeronumber1.model.User;
import fr.numeronumber1.repository.PasswordResetTokenRepository;
import fr.numeronumber1.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PasswordServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private PasswordService passwordService;

    private User alice;

    @BeforeEach
    void setUp() {
        alice = new User();
        alice.setUserId(1);
        alice.setUsername("alice");
        alice.setEmail("alice@test.com");
        alice.setPasswordHash("hashed_old");
    }

    // --- changePassword ---

    @Test
    void changePassword_succes() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));
        when(passwordEncoder.matches("oldPass", "hashed_old")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("hashed_new");

        passwordService.changePassword("alice", "oldPass", "newPass", "newPass");

        verify(userRepository).save(alice);
        assertEquals("hashed_new", alice.getPasswordHash());
    }

    @Test
    void changePassword_echoue_si_confirmation_differente() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> passwordService.changePassword("alice", "oldPass", "newPass", "wrongPass"));

        assertEquals("Les mots de passe ne correspondent pas", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_echoue_si_ancien_mot_de_passe_incorrect() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));
        when(passwordEncoder.matches("wrongOldPass", "hashed_old")).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> passwordService.changePassword("alice", "wrongOldPass", "newPass", "newPass"));

        assertEquals("L'ancien mot de passe est incorrect", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_echoue_si_user_introuvable() {
        when(userRepository.findByUsername("inconnu")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> passwordService.changePassword("inconnu", "oldPass", "newPass", "newPass"));

        assertEquals("Utilisateur introuvable", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    // --- forgotPassword ---

    @Test
    void forgotPassword_genere_token_et_envoie_email() {
        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(alice));

        passwordService.forgotPassword("alice@test.com");

        verify(tokenRepository).deleteByUser_UserId(1);
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void forgotPassword_ne_fait_rien_si_email_inconnu() {
        when(userRepository.findByEmail("inconnu@test.com")).thenReturn(Optional.empty());

        passwordService.forgotPassword("inconnu@test.com");

        verify(tokenRepository, never()).deleteByUser_UserId(any());
        verify(tokenRepository, never()).save(any());
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    // --- resetPassword ---

    @Test
    void resetPassword_succes() {
        PasswordResetToken token = new PasswordResetToken();
        token.setToken("validToken");
        token.setUser(alice);
        token.setUsed(false);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(15));

        when(tokenRepository.findByToken("validToken")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("newPass")).thenReturn("hashed_new");

        passwordService.resetPassword("validToken", "newPass", "newPass");

        assertEquals("hashed_new", alice.getPasswordHash());
        assertTrue(token.isUsed());
        verify(userRepository).save(alice);
        verify(tokenRepository).save(token);
    }

    @Test
    void resetPassword_echoue_si_confirmation_differente() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> passwordService.resetPassword("token", "newPass", "wrongPass"));

        assertEquals("Les mots de passe ne correspondent pas", ex.getMessage());
    }

    @Test
    void resetPassword_echoue_si_token_introuvable() {
        when(tokenRepository.findByToken("invalidToken")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> passwordService.resetPassword("invalidToken", "newPass", "newPass"));

        assertEquals("Token invalide ou expiré", ex.getMessage());
    }

    @Test
    void resetPassword_echoue_si_token_deja_utilise() {
        PasswordResetToken token = new PasswordResetToken();
        token.setToken("usedToken");
        token.setUser(alice);
        token.setUsed(true);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(15));

        when(tokenRepository.findByToken("usedToken")).thenReturn(Optional.of(token));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> passwordService.resetPassword("usedToken", "newPass", "newPass"));

        assertEquals("Ce token a déjà été utilisé", ex.getMessage());
    }

    @Test
    void resetPassword_echoue_si_token_expire() {
        PasswordResetToken token = new PasswordResetToken();
        token.setToken("expiredToken");
        token.setUser(alice);
        token.setUsed(false);
        token.setExpiresAt(LocalDateTime.now().minusMinutes(5));

        when(tokenRepository.findByToken("expiredToken")).thenReturn(Optional.of(token));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> passwordService.resetPassword("expiredToken", "newPass", "newPass"));

        assertEquals("Token invalide ou expiré", ex.getMessage());
    }
}
