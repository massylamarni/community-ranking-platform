package fr.numeronumber1.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fr.numeronumber1.dto.request.CreateCommentRequest;
import fr.numeronumber1.dto.request.UpdateCommentRequest;
import fr.numeronumber1.dto.response.CommentPageResponse;
import fr.numeronumber1.dto.response.CommentResponse;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.exception.UnauthorizedActionException;
import fr.numeronumber1.model.Comment;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.repository.CommentRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final OeuvreRepository oeuvreRepository;
    private final FileStorageService fileStorageService;

    public CommentService(
            CommentRepository commentRepository,
            OeuvreRepository oeuvreRepository,
            FileStorageService fileStorageService) {
        this.commentRepository = commentRepository;
        this.oeuvreRepository = oeuvreRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public Comment createComment(Long oeuvreId, CreateCommentRequest request, User author) {
        if (author == null) {
            throw new UnauthorizedActionException("Vous devez être connecté pour commenter.");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new IllegalArgumentException("Le contenu du commentaire ne peut pas être vide");
        }

        Oeuvre oeuvre = oeuvreRepository.findById(oeuvreId)
                .orElseThrow(() -> new ResourceNotFoundException("Œuvre introuvable"));

        Comment parentComment = null;
        if (request.getParentCommentId() != null) {
            parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Commentaire parent introuvable"));
            if (!Objects.equals(parentComment.getOeuvre().getOeuvreId(), oeuvreId)) {
                throw new IllegalArgumentException(
                        "Le commentaire parent doit appartenir à la même œuvre");
            }
        } else if (Objects.equals(oeuvre.getAuthor().getUserId(), author.getUserId())) {
            throw new UnauthorizedActionException(
                    "Vous ne pouvez pas commenter votre propre œuvre.");
        }

        Comment comment = new Comment();
        comment.setOeuvre(oeuvre);
        comment.setUser(author);
        comment.setParentComment(parentComment);
        comment.setContent(request.getContent().trim());
        comment.setCreatedAt(LocalDateTime.now());
        MultipartFile image = request.getImage();
        if (image != null && !image.isEmpty()) {
            comment.setImageUrl(fileStorageService.store(image, "comments"));
        }
        return commentRepository.save(comment);
    }

    @Transactional
    public CommentResponse updateComment(Integer commentId, UpdateCommentRequest request, User currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedActionException("Vous devez être connecté pour modifier un commentaire.");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire introuvable"));

        if (!Objects.equals(comment.getUser().getUserId(), currentUser.getUserId())) {
            throw new UnauthorizedActionException("Vous n'êtes pas autorisé à modifier ce commentaire.");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new IllegalArgumentException("Le contenu du commentaire ne peut pas être vide");
        }

        comment.setContent(request.getContent().trim());
        MultipartFile image = request.getImage();
        if (image != null && !image.isEmpty()) {
            comment.setImageUrl(fileStorageService.store(image, "comments"));
        }
        return new CommentResponse(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Integer commentId, User currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedActionException("Vous devez être connecté pour supprimer un commentaire.");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Commentaire introuvable"));

        if (!Objects.equals(comment.getUser().getUserId(), currentUser.getUserId()) && !currentUser.isAdmin()) {
            throw new UnauthorizedActionException("Vous n'êtes pas autorisé à supprimer ce commentaire.");
        }

        deleteReplies(comment);
        commentRepository.delete(comment);
    }

    private void deleteReplies(Comment parentComment) {
        List<Comment> replies = commentRepository
                .findByParentCommentCommentIdOrderByCommentIdAsc(parentComment.getCommentId());
        for (Comment reply : replies) {
            deleteReplies(reply);
            commentRepository.delete(reply);
        }
    }

    @Transactional(readOnly = true)
    public CommentPageResponse getCommentsByWork(Long oeuvreId, int page, int pageSize) {
        if (page < 1 || pageSize < 1) {
            throw new IllegalArgumentException("La page et la taille de page doivent être positives.");
        }

        if (!oeuvreRepository.existsById(oeuvreId)) {
            throw new ResourceNotFoundException("Œuvre introuvable");
        }

        List<Comment> comments = commentRepository
                .findByOeuvreOeuvreIdOrderByCommentIdAsc(oeuvreId);
        Map<Integer, List<Comment>> repliesByParentId = new HashMap<>();
        List<Comment> roots = new ArrayList<>();

        for (Comment comment : comments) {
            if (comment.getParentComment() == null) {
                roots.add(comment);
            } else {
                repliesByParentId
                        .computeIfAbsent(comment.getParentComment().getCommentId(), ignored -> new ArrayList<>())
                        .add(comment);
            }
        }

        long offset = (long) (page - 1) * pageSize;
        List<CommentResponse> items = offset >= roots.size()
                ? List.of()
                : roots.subList((int) offset, (int) Math.min(offset + pageSize, roots.size()))
                        .stream()
                        .map(root -> toCommentResponse(root, repliesByParentId))
                        .toList();

        return new CommentPageResponse(items, page, pageSize, roots.size());
    }

    private CommentResponse toCommentResponse(
            Comment comment,
            Map<Integer, List<Comment>> repliesByParentId) {
        List<CommentResponse> replies = repliesByParentId
                .getOrDefault(comment.getCommentId(), List.of())
                .stream()
                .map(reply -> toCommentResponse(reply, repliesByParentId))
                .toList();

        return new CommentResponse(comment, replies);
    }
}
