package fr.numeronumber1.dto.response;

import fr.numeronumber1.model.Vote;

public class VoteResponse {

    private Integer id;
    private Long workId;
    private Integer userId;
    private String type;

    public VoteResponse(Vote vote) {
        this.id = vote.getVoteId();
        this.workId = vote.getOeuvre().getOeuvreId();
        this.userId = vote.getUser().getUserId();
        this.type = vote.getValue() == 1 ? "positive" : "negative";
    }

    public Integer getId() {
        return id;
    }

    public Long getWorkId() {
        return workId;
    }

    public Integer getUserId() {
        return userId;
    }

    public String getType() {
        return type;
    }
}