package fr.numeronumber1.dto.response;

import fr.numeronumber1.model.Vote;

public class UserVoteResponse {

    private Long workId;
    private String workTitle;
    private String vote;

    public UserVoteResponse(Vote vote) {
        this.workId = vote.getOeuvre().getOeuvreId();
        this.workTitle = vote.getOeuvre().getTitle();
        this.vote = vote.getValue() == 1 ? "positive" : "negative";
    }

    public Long getWorkId() {
        return workId;
    }

    public String getWorkTitle() {
        return workTitle;
    }

    public String getVote() {
        return vote;
    }
}