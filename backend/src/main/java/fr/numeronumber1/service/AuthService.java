package fr.numeronumber1.service;

import fr.numeronumber1.dto.request.RegisterRequest;
import fr.numeronumber1.exception.EmailAlreadyExistsException;
import fr.numeronumber1.exception.UsernameAlreadyExistsException;
import fr.numeronumber1.model.User;
import fr.numeronumber1.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;

    public AuthService(UserRepository users, PasswordEncoder encoder, AuthenticationManager authManager) {
        this.users = users;
        this.encoder = encoder;
        this.authManager = authManager;
    }

    @Transactional
    public User register(RegisterRequest req) {
        if (users.existsByUsername(req.getUsername()))
            throw new UsernameAlreadyExistsException("Nom d'utilisateur déjà enregistré");
        if (users.existsByEmail(req.getEmail()))
            throw new EmailAlreadyExistsException("Email déjà enregistré");

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setAdmin(false);
        user.setCreatedAt(LocalDateTime.now());
        return users.save(user);
    }

    public Authentication authenticate(String credential, String password) {
        return authManager.authenticate(new UsernamePasswordAuthenticationToken(credential, password));
    }
}
