package fr.numeronumber1.dto.response;

import java.util.List;

public record OeuvreVoteResponse(
        OeuvreResponse oeuvre,
        List<VoteItemResponse> votes
) {
}