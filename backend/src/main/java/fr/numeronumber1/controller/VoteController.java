package fr.numeronumber1.controller;

import java.util.List;

import fr.numeronumber1.model.Oeuvre;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import fr.numeronumber1.dto.request.VoteRequest;
import fr.numeronumber1.dto.response.UserVoteResponse;
import fr.numeronumber1.dto.response.VoteResponse;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
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
        public ResponseEntity<Oeuvre> vote(
                @PathVariable Long workId,
                @RequestBody VoteRequest request,
                Authentication authentication
        ) {
            User user = userService.findByUsername(authentication.getName());

            Oeuvre oeuvre = voteService.vote(workId, request, user);

            return ResponseEntity.ok(oeuvre);
        }

    @GetMapping("/{workId}/vote")
    public ResponseEntity<List<Vote>> getVotesByWork(
            @PathVariable Long workId) {

        List<Vote> votes = voteService.getVotesByWork(workId);
        return ResponseEntity.ok(votes);
    }
}
