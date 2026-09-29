package fr.numeronumber1.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.numeronumber1.dto.request.RefuseWork;
import fr.numeronumber1.dto.response.OeuvreResponse;
import fr.numeronumber1.service.ModerationService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/moderation")
public class ModerationController {

    private final ModerationService moderationService;

    public ModerationController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @GetMapping("/works")
    public ResponseEntity<Page<OeuvreResponse>> getPendingWorks(Pageable pageable) {
        return ResponseEntity.ok(
                moderationService.getPendingWorks(pageable).map(OeuvreResponse::new)
        );
    }

    @PostMapping("/works/{workId}/accept")
    public ResponseEntity<OeuvreResponse> acceptWork(
            @PathVariable Long workId) {

        return ResponseEntity.ok(
                new OeuvreResponse(moderationService.accept(workId))
        );
    }

    @PostMapping("/works/{workId}/refuse")
    public ResponseEntity<OeuvreResponse> refuseWork(
            @PathVariable Long workId,
            @Valid @RequestBody RefuseWork request) {

        return ResponseEntity.ok(
                new OeuvreResponse(moderationService.refuse(workId, request))
        );
    }
}