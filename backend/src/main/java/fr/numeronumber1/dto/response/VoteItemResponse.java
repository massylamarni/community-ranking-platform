package fr.numeronumber1.dto.response;

import java.time.LocalDateTime;

import fr.numeronumber1.model.Vote;

public record VoteItemResponse(
        Integer id,
        Integer userId,
        Byte value,
        LocalDateTime createdAt
) {
    public VoteItemResponse(Vote vote) {
        this(
                vote.getVoteId(),
                vote.getUser().getUserId(),
                vote.getValue(),
                vote.getCreatedAt()
        );
    }
}