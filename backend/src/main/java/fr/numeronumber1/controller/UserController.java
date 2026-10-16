package fr.numeronumber1.controller;

import fr.numeronumber1.dto.response.PublicProfileResponse;
import fr.numeronumber1.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}/public_profile")
    public ResponseEntity<PublicProfileResponse> getPublicProfile(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(userService.getPublicProfile(userId));
    }

}
