package fr.numeronumber1.controller;

import fr.numeronumber1.dto.request.RefuseWork;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.service.ModerationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/moderation")
public class ModerationController {

    private final ModerationService moderationService;

    public ModerationController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @GetMapping("/works")
    public ResponseEntity<Page<Oeuvre>> getPendingWorks(Pageable pageable) {
        return ResponseEntity.ok(
                moderationService.getPendingWorks(pageable)
        );
    }

    @PostMapping("/works/{workId}/accept")
    public ResponseEntity<Oeuvre> acceptWork(
            @PathVariable Long workId) {

        return ResponseEntity.ok(
                moderationService.accept(workId)
        );
    }

    @PostMapping("/works/{workId}/refuse")
    public ResponseEntity<Oeuvre> refuseWork(
            @PathVariable Long workId,
            @Valid @RequestBody RefuseWork request) {

        return ResponseEntity.ok(
                moderationService.refuse(workId, request)
        );
    }
}