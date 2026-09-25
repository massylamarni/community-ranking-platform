package fr.numeronumber1.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fr.numeronumber1.model.PasswordResetToken;
import fr.numeronumber1.model.User;
import fr.numeronumber1.repository.PasswordResetTokenRepository;
import fr.numeronumber1.repository.UserRepository;

@Service
public class PasswordService {

    private static final Logger log = LoggerFactory.getLogger(PasswordService.class);
    private static final int TOKEN_VALIDITY_MINUTES = 30;

    private final UserRepository users;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder encoder;
    private final JavaMailSender mailSender;

    public PasswordService(UserRepository users,
                           PasswordResetTokenRepository tokens,
                           PasswordEncoder encoder,
                           JavaMailSender mailSender) {
        this.users = users;
        this.tokens = tokens;
        this.encoder = encoder;
        this.mailSender = mailSender;
    }

    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Les mots de passe ne correspondent pas");
        }

        User user = users.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        if (!encoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("L'ancien mot de passe est incorrect");
        }

        user.setPasswordHash(encoder.encode(newPassword));
        users.save(user);
    }

    @Transactional
    public void forgotPassword(String email) {
        // On ne révèle pas si l'adresse est connue ou non (anti-énumération)
        users.findByEmail(email).ifPresent(user -> {
            // Supprime les anciens tokens de cet utilisateur
            tokens.deleteByUser_UserId(user.getUserId());

            String rawToken = generateToken();

            PasswordResetToken prt = new PasswordResetToken();
            prt.setUser(user);
            prt.setToken(rawToken);
            prt.setExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_VALIDITY_MINUTES));
            tokens.save(prt);

            // TODO: remplacer par un vrai envoi d'e-mail
            log.info("Lien de réinitialisation pour {} : /auth/password/reset?token={}", email, rawToken);
            sendResetEmail(email, rawToken);
        });
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Les mots de passe ne correspondent pas");
        }

        PasswordResetToken prt = tokens.findByToken(rawToken)
                .orElseThrow(() -> new IllegalArgumentException("Token invalide ou expiré"));

        if (prt.isUsed()) {
            throw new IllegalArgumentException("Ce token a déjà été utilisé");
        }

        if (prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token invalide ou expiré");
        }

        User user = prt.getUser();
        user.setPasswordHash(encoder.encode(newPassword));
        users.save(user);

        prt.setUsed(true);
        tokens.save(prt);
    }

    private String generateToken() {
        byte[] bytes = new byte[12];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private void sendResetEmail(String to, String token) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("Réinitialisation de votre mot de passe");
        msg.setText(
            "Bonjour,\n\n" +
            "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
            "Utilisez le token ci-dessous dans l'application (valable 30 minutes) :\n\n" +
            token + "\n\n" +
            "L'équipe Numéro1"
        );
        mailSender.send(msg);
    }
}
