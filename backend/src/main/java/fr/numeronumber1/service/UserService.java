package fr.numeronumber1.service;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import fr.numeronumber1.exception.EmailAlreadyExistsException;
import fr.numeronumber1.exception.UsernameAlreadyExistsException;
import fr.numeronumber1.model.User;
import fr.numeronumber1.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + username));

        List<SimpleGrantedAuthority> authorities = user.isAdmin()
                ? List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_USER"))
                : List.of(new SimpleGrantedAuthority("ROLE_USER"));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                authorities
        );
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + username));
    }
    
    @Transactional
    public User updateProfile(String currentUsername, String newUsername, String newEmail) {
        User user = findByUsername(currentUsername);

        String finalUsername = (newUsername == null || newUsername.isBlank()) ? currentUsername : newUsername;
        String finalEmail = (newEmail == null || newEmail.isBlank()) ? user.getEmail() : newEmail;

        if (!currentUsername.equals(finalUsername) && userRepository.existsByUsername(finalUsername)) {
            throw new UsernameAlreadyExistsException("Nom d'utilisateur déjà enregistré");
        }

        if (!user.getEmail().equals(finalEmail) && userRepository.existsByEmail(finalEmail)) {
            throw new EmailAlreadyExistsException("Email déjà enregistré");
        }

        user.setUsername(finalUsername);
        user.setEmail(finalEmail);
        return userRepository.save(user);
    }
}
