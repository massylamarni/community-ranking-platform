package fr.numeronumber1.security;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.exception.UnauthorizedActionException;
import fr.numeronumber1.model.Comment;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.repository.CommentRepository;
import fr.numeronumber1.repository.OeuvreRepository;

@Component("guard")
public class OwnershipHelper {

    private final OeuvreRepository oeuvreRepository;
    private final CommentRepository commentRepository;

    public OwnershipHelper(OeuvreRepository oeuvreRepository, CommentRepository commentRepository) {
        this.oeuvreRepository = oeuvreRepository;
        this.commentRepository = commentRepository;
    }

    public boolean isAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken);
    }

    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    public boolean isWorkAuthor(Integer workId) {
        String currentUsername = getCurrentUsername();
        if (currentUsername == null) return false;

        Oeuvre oeuvre = oeuvreRepository.findById(workId)
                .orElseThrow(() -> new ResourceNotFoundException("Œuvre introuvable : " + workId));
        return currentUsername.equals(oeuvre.getAuthor().getUsername());
    }

    public boolean isWorkAuthorOrAdmin(Integer workId) {
        return isAdmin() || isWorkAuthor(workId);
    }

    public boolean isCommentAuthor(Integer commentId) {
        String currentUsername = getCurrentUsername();
        if (currentUsername == null) return false;

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire introuvable : " + commentId));
        return currentUsername.equals(comment.getUser().getUsername());
    }

    public boolean isCommentAuthorOrAdmin(Integer commentId) {
        return isAdmin() || isCommentAuthor(commentId);
    }

    public void checkWorkAuthor(Integer workId) {
        if (!isWorkAuthor(workId)) {
            throw new UnauthorizedActionException("Action réservée à l'auteur de cette œuvre");
        }
    }

    public void checkWorkAuthorOrAdmin(Integer workId) {
        if (!isWorkAuthorOrAdmin(workId)) {
            throw new UnauthorizedActionException("Action réservée à l'auteur ou à un administrateur");
        }
    }

    public void checkCommentAuthor(Integer commentId) {
        if (!isCommentAuthor(commentId)) {
            throw new UnauthorizedActionException("Action réservée à l'auteur de ce commentaire");
        }
    }

    public void checkCommentAuthorOrAdmin(Integer commentId) {
        if (!isCommentAuthorOrAdmin(commentId)) {
            throw new UnauthorizedActionException("Action réservée à l'auteur ou à un administrateur");
        }
    }

    public void checkCanVoteOnWork(Integer workId) {
        if (isWorkAuthor(workId)) {
            throw new UnauthorizedActionException("Impossible de voter pour sa propre œuvre");
        }
    }

    public void checkCanCreateCommentOnWork(Integer workId, Integer parentCommentId) {
        if (parentCommentId == null && isWorkAuthor(workId)) {
            throw new UnauthorizedActionException("Impossible d'ajouter un commentaire principal sur sa propre œuvre");
        }
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken))
                ? auth.getName()
                : null;
    }
}
