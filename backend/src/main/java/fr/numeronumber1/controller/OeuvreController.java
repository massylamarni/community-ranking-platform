package fr.numeronumber1.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import fr.numeronumber1.dto.request.CreateOeuvreRequest;
import fr.numeronumber1.dto.request.SubmitOeuvreRequest;
import fr.numeronumber1.dto.response.OeuvreResponse;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.service.OeuvreService;
import fr.numeronumber1.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/works")
public class OeuvreController {

    private final OeuvreService oeuvreService;
    private final UserService userService;

    public OeuvreController(OeuvreService oeuvreService, UserService userService) {
        this.oeuvreService = oeuvreService;
        this.userService = userService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<OeuvreResponse> createJson(@Valid @RequestBody CreateOeuvreRequest req,
                                                     Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        Oeuvre saved = oeuvreService.create(req, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new OeuvreResponse(saved));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OeuvreResponse> createMultipart(@Valid @ModelAttribute CreateOeuvreRequest req,
                                                          Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        Oeuvre saved = oeuvreService.create(req, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new OeuvreResponse(saved));
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OeuvreResponse> uploadImage(@PathVariable Long id,
                                                      @RequestParam("image") MultipartFile image,
                                                      Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        Oeuvre updated = oeuvreService.uploadImage(id, image, user);
        return ResponseEntity.ok(new OeuvreResponse(updated));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<OeuvreResponse> submit(@PathVariable Long id,
                                                  @Valid @RequestBody SubmitOeuvreRequest req,
                                                  Authentication auth) {
        User user = userService.findByUsername(auth.getName());
        Oeuvre updated = oeuvreService.submit(id, req, user);
        return ResponseEntity.ok(new OeuvreResponse(updated));
    }
}
