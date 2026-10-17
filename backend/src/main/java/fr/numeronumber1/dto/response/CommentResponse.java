package fr.numeronumber1.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import fr.numeronumber1.model.Comment;

public class CommentResponse {
    private String id;
    private Long oeuvreId;
    private String content;
    private String imageUrl;
    private AuthorResponse author;
    private String parentCommentId;
    private List<CommentResponse> replies;
    private LocalDateTime createdAt;

    public CommentResponse(Comment comment) {
        this(comment, List.of());
    }

    public CommentResponse(Comment comment, List<CommentResponse> replies) {
        this.id = comment.getCommentId().toString();
        this.oeuvreId = comment.getOeuvre().getOeuvreId();
        this.content = comment.getContent();
        this.imageUrl = comment.getImageUrl();
        this.author = new AuthorResponse(comment.getUser().getUsername());
        this.parentCommentId = comment.getParentComment() == null
                ? null
                : comment.getParentComment().getCommentId().toString();
        this.replies = List.copyOf(replies);
        this.createdAt = comment.getCreatedAt();
    }

    public String getId() {
        return id;
    }

    public Long getOeuvreId() {
        return oeuvreId;
    }

    public String getContent() {
        return content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public AuthorResponse getAuthor() {
        return author;
    }

    public String getUsername() {
        return author.username();
    }

    public String getParentCommentId() {
        return parentCommentId;
    }

    public List<CommentResponse> getReplies() {
        return replies;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public record AuthorResponse(String username) {
    }
}
