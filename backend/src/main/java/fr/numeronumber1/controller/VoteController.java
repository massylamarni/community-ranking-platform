package fr.numeronumber1.controller;

import fr.numeronumber1.dto.response.OeuvreVoteResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import fr.numeronumber1.dto.request.VoteRequest;
import fr.numeronumber1.dto.response.VoteResponse;
import fr.numeronumber1.model.User;
import fr.numeronumber1.service.UserService;
import fr.numeronumber1.service.VoteService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/works")
public class VoteController {

    private final VoteService voteService;
    private final UserService userService;

    public VoteController(VoteService voteService, UserService userService) {
        this.voteService = voteService;
        this.userService = userService;
    }

        @PutMapping("/{workId}/vote")
        public ResponseEntity<VoteResponse> vote(
                @PathVariable Long workId,
                @RequestBody VoteRequest request,
                Authentication authentication
        ) {
            User user = userService.findByUsername(authentication.getName());

            VoteResponse voteResponse = voteService.vote(workId, request, user);

            return ResponseEntity.ok(voteResponse);
        }

    @GetMapping("/{workId}/vote")
    public ResponseEntity<VoteResponse> getMyVote(
            @PathVariable Long workId,
            Authentication authentication) {

        User user = userService.findByUsername(authentication.getName());
        VoteResponse response = voteService.getMyVote(workId, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{workId}/votes")
    public ResponseEntity<OeuvreVoteResponse> getVotesByWork(
            @PathVariable Long workId
    ) {
        OeuvreVoteResponse response = voteService.getOeuvreVotes(workId);
        return ResponseEntity.ok(response);
    }
}
