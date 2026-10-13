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
@RequestMapping("/work")
public class VoteController {

    private final VoteService voteService;
    private final UserService userService;

    public VoteController(VoteService voteService, UserService userService) {
        this.voteService = voteService;
        this.userService = userService;
    }

    http.put("*/works/:workId/vote", async ({ request, params }) => {
        await delay(150);

    const user = currentUserFrom(request);
        if (!user) return unauthorized();

    const work = db.findWorkByApiId(params.workId);
        if (!work) return notFound("Œuvre introuvable.");

        if (work.authorId === user.id)
            return forbidden("Vous ne pouvez pas voter pour votre propre œuvre.");

    const body = (await request.json()) as VoteForWorkPayload;
    const newValue = body.value;

        if (newValue !== null && newValue !== 1 && newValue !== -1)
            return errorResponse(422, "Échec de la validation", {
                    value: "La valeur du vote est invalide.",
      });

    const existingIndex = work.votes.findIndex((v) => v.userId === user.id);

        if (newValue === null) {
            if (existingIndex !== -1) work.votes.splice(existingIndex, 1);
        } else if (existingIndex !== -1) {
            work.votes[existingIndex].value = newValue;
        } else {

            work.votes.push({
                    userId: user.id,
                    value: newValue,
                    createdAt: new Date().toISOString(),
      });
        }

        return HttpResponse.json(db.serializeWork(work, user));
    })
}