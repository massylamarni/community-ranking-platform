package fr.numeronumber1.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.numeronumber1.dto.request.ChangePasswordRequest;
import fr.numeronumber1.dto.request.ForgotPasswordRequest;
import fr.numeronumber1.dto.request.LoginRequest;
import fr.numeronumber1.dto.request.RegisterRequest;
import fr.numeronumber1.dto.request.ResetPasswordRequest;
import fr.numeronumber1.model.User;
import fr.numeronumber1.service.AuthService;
import fr.numeronumber1.service.PasswordService;
import fr.numeronumber1.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final PasswordService passwordService;
    private final HttpSessionSecurityContextRepository contextRepo
            = new HttpSessionSecurityContextRepository();

    public AuthController(AuthService authService, UserService userService, PasswordService passwordService) {
        this.authService = authService;
        this.userService = userService;
        this.passwordService = passwordService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        User user = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("userId", user.getUserId(), "username", user.getUsername()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req,
                                   HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = authService.authenticate(req.getUsername(), req.getPassword());

        SecurityContext ctx = SecurityContextHolder.createEmptyContext();
        ctx.setAuthentication(auth);
        SecurityContextHolder.setContext(ctx);
        contextRepo.saveContext(ctx, request, response);

        User user = userService.findByUsername(auth.getName());
        return ResponseEntity.ok(Map.of("userId", user.getUserId(), "username", user.getUsername()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        return ResponseEntity.ok(Map.of(
                "id", String.valueOf(user.getUserId()),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.isAdmin() ? "admin" : "user"
        ));
    }

    @PostMapping("/password/change")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req,
                                               Authentication auth) {
        passwordService.changePassword(
                auth.getName(),
                req.getOldPassword(),
                req.getNewPassword(),
                req.getConfirmPassword()
        );
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/password/forgot")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        passwordService.forgotPassword(req.getEmail());
        // Toujours 202 pour ne pas révéler si l'adresse est connue
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/password/reset")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        passwordService.resetPassword(
                req.getToken(),
                req.getNewPassword(),
                req.getConfirmPassword()
        );
        return ResponseEntity.noContent().build();
    }
}
