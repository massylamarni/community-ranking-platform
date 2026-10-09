package fr.numeronumber1.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.numeronumber1.dto.request.VoteRequest;
import fr.numeronumber1.dto.response.UserVoteResponse;
import fr.numeronumber1.dto.response.VoteResponse;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.service.UserService;
import fr.numeronumber1.service.VoteService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/votes")
public class VoteController {

    private final VoteService voteService;
    private final UserService userService;

    public VoteController(VoteService voteService, UserService userService) {
        this.voteService = voteService;
        this.userService = userService;
    }

    @PostMapping("/work/{id}")
    public ResponseEntity<VoteResponse> createVote(
            @PathVariable Long id,
            @Valid @RequestBody VoteRequest req,
            Authentication auth) {

        User user = userService.findByUsername(auth.getName());
        Vote saved = voteService.createVote(id, req, user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new VoteResponse(saved));
    }

    @PatchMapping("/work/{id}")
    public ResponseEntity<VoteResponse> updateVote(
            @PathVariable Long id,
            @Valid @RequestBody VoteRequest req,
            Authentication auth) {

        User user = userService.findByUsername(auth.getName());
        Vote updated = voteService.updateVote(id, req, user);

        return ResponseEntity.ok(new VoteResponse(updated));
    }

    @DeleteMapping("/work/{id}")
    public ResponseEntity<Void> deleteVote(
            @PathVariable Long id,
            Authentication auth) {

        User user = userService.findByUsername(auth.getName());
        voteService.deleteVote(id, user);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/work/me")
    public ResponseEntity<List<UserVoteResponse>> getMyVotes(
            Authentication auth) {

        User user = userService.findByUsername(auth.getName());
        List<UserVoteResponse> votes = voteService.getMyVotes(user);

        return ResponseEntity.ok(votes);
    }
}