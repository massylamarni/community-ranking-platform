package fr.numeronumber1.controller;

import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.service.VoteService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping("/work/{id}")
    public ResponseEntity<Vote> createVote(
            @PathVariable Long id,
            @RequestBody VoteRequest request,
            User user) {

        Vote vote = voteService.createVote(
                id,
                request.getValue(),
                user
        );

        return ResponseEntity.status(201).body(vote);
    }

    @PatchMapping("/work/{id}")
    public ResponseEntity<Vote> updateVote(
            @PathVariable Long id,
            @RequestBody VoteRequest request,
            User user) {

        Vote vote = voteService.updateVote(
                id,
                request.getValue(),
                user
        );

        return ResponseEntity.ok(vote);
    }

    @DeleteMapping("/work/{id}")
    public ResponseEntity<Void> deleteVote(
            @PathVariable Long id,
            User user) {

        voteService.deleteVote(id, user);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/work/me")
    public ResponseEntity<List<Vote>> getMyVotes(User user) {

        return ResponseEntity.ok(
                voteService.getMyVotes(user)
        );
    }
}