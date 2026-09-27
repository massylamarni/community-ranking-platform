package fr.numeronumber1.security;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/test-security")
public class TestSecurityController {

    private final OwnershipHelper ownershipHelper;

    public TestSecurityController(OwnershipHelper ownershipHelper) {
        this.ownershipHelper = ownershipHelper;
    }

    @GetMapping("/public")
    public ResponseEntity<String> publicEndpoint() {
        return ResponseEntity.ok("public-ok");
    }

    @GetMapping("/authenticated")
    @RequireAuthenticated
    public ResponseEntity<String> authenticatedEndpoint() {
        return ResponseEntity.ok("authenticated-ok");
    }

    @GetMapping("/admin")
    @RequireAdmin
    public ResponseEntity<String> adminEndpoint() {
        return ResponseEntity.ok("admin-ok");
    }

    @PatchMapping("/works/{workId}")
    @PreAuthorize("@guard.isWorkAuthor(#workId)")
    public ResponseEntity<String> editWork(@PathVariable Integer workId) {
        return ResponseEntity.ok("work-edited");
    }

    @DeleteMapping("/works/{workId}")
    @PreAuthorize("@guard.isWorkAuthorOrAdmin(#workId)")
    public ResponseEntity<String> deleteWork(@PathVariable Integer workId) {
        return ResponseEntity.ok("work-deleted");
    }

    @PatchMapping("/comments/{commentId}")
    @PreAuthorize("@guard.isCommentAuthor(#commentId)")
    public ResponseEntity<String> editComment(@PathVariable Integer commentId) {
        return ResponseEntity.ok("comment-edited");
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("@guard.isCommentAuthorOrAdmin(#commentId)")
    public ResponseEntity<String> deleteComment(@PathVariable Integer commentId) {
        return ResponseEntity.ok("comment-deleted");
    }

    @PostMapping("/works/{workId}/vote")
    public ResponseEntity<String> voteWork(@PathVariable Long workId) {
        ownershipHelper.checkCanVoteOnWork(workId);
        return ResponseEntity.ok("voted-ok");
    }

    @PostMapping("/works/{workId}/comments")
    public ResponseEntity<String> commentWork(@PathVariable Long workId,
                                              @RequestParam(required = false) Integer parentCommentId) {
        ownershipHelper.checkCanCreateCommentOnWork(workId, parentCommentId);
        return ResponseEntity.ok("comment-created-ok");
    }
}
