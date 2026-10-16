package fr.numeronumber1.controller;

import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.numeronumber1.dto.request.CreateCommentRequest;
import fr.numeronumber1.dto.request.UpdateCommentRequest;
import fr.numeronumber1.dto.response.CommentPageResponse;
import fr.numeronumber1.dto.response.CommentResponse;
import fr.numeronumber1.model.Comment;
import fr.numeronumber1.model.User;
import fr.numeronumber1.service.CommentService;
import fr.numeronumber1.service.UserService;
import jakarta.validation.Valid;

@RestController
@Validated
public class CommentController {
    private final CommentService commentService;
    private final UserService userService;

    public CommentController(CommentService commentService, UserService userService) {
        this.commentService = commentService;
        this.userService = userService;
    }

    @GetMapping("/works/{workId}/comments")
    public ResponseEntity<CommentPageResponse> getComments(
            @PathVariable Long workId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(commentService.getCommentsByWork(workId, page, pageSize));
    }

    @PostMapping(value = "/works/{workId}/comments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommentResponse> createMultipartComment(
            @PathVariable Long workId,
            @Valid @ModelAttribute CreateCommentRequest request,
            Authentication authentication) {
        return create(workId, request, authentication);
    }

    @PostMapping(value = "/works/{workId}/comments", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CommentResponse> createJsonComment(
            @PathVariable Long workId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        return create(workId, request, authentication);
    }

    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Integer commentId,
            @Valid @RequestBody UpdateCommentRequest request,
            Authentication authentication) {
        User currentUser = userService.findByUsername(authentication.getName());
        return ResponseEntity.ok(commentService.updateComment(commentId, request, currentUser));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Integer commentId,
            Authentication authentication) {
        User currentUser = userService.findByUsername(authentication.getName());
        commentService.deleteComment(commentId, currentUser);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<CommentResponse> create(
            Long workId,
            CreateCommentRequest request,
            Authentication authentication) {
        User author = userService.findByUsername(authentication.getName());
        Comment comment = commentService.createComment(workId, request, author);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CommentResponse(comment));
    }
}
