package fr.numeronumber1.dto.response;

import fr.numeronumber1.model.Vote;

import java.time.LocalDateTime;

public record VoteResponse(
        Integer id,
        Integer userId,
        Byte value,
        LocalDateTime createdAt,
        OeuvreResponse oeuvre
) {
    public VoteResponse(Vote vote, OeuvreResponse oeuvre) {
        this(
                vote.getVoteId(),
                vote.getUser().getUserId(),
                vote.getValue(),
                vote.getCreatedAt(),
                oeuvre
        );
    }
}