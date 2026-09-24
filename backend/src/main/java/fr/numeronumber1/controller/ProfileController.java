package fr.numeronumber1.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.numeronumber1.dto.request.UpdateProfileRequest;
import fr.numeronumber1.model.User;
import fr.numeronumber1.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return ResponseEntity.ok(toProfileMap(user));
    }

    @PatchMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest req, Authentication auth) {
        User user = userService.updateProfile(auth.getName(), req.getUsername(), req.getEmail());

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user.getUsername(), auth.getCredentials(), auth.getAuthorities())
        );

        return ResponseEntity.ok(toProfileMap(user));
    }

    private Map<String, Object> toProfileMap(User user) {
        return Map.of(
                "id", String.valueOf(user.getUserId()),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.isAdmin() ? "admin" : "user"
        );
    }
}
