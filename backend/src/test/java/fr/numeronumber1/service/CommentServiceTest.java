package fr.numeronumber1.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import fr.numeronumber1.dto.request.CreateCommentRequest;
import fr.numeronumber1.dto.request.UpdateCommentRequest;
import fr.numeronumber1.dto.response.CommentPageResponse;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.exception.UnauthorizedActionException;
import fr.numeronumber1.model.Comment;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.repository.CommentRepository;
import fr.numeronumber1.repository.OeuvreRepository;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {
    @Mock
    private CommentRepository commentRepository;

    @Mock
    private OeuvreRepository oeuvreRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private CommentService commentService;

    private User owner;
    private User author;
    private Oeuvre oeuvre;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setUserId(1);
        owner.setUsername("owner");

        author = new User();
        author.setUserId(2);
        author.setUsername("author");

        oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(10L);
        oeuvre.setAuthor(owner);
    }

    @Test
    void createsCommentWithAuthenticatedAuthorAndTimestamp() {
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(commentRepository.save(org.mockito.ArgumentMatchers.any(Comment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Comment result = commentService.createComment(10L, request("  Beau travail  ", null), author);

        assertEquals("Beau travail", result.getContent());
        assertEquals(author, result.getUser());
        assertEquals(oeuvre, result.getOeuvre());
        assertNotNull(result.getCreatedAt());
        assertNull(result.getImageUrl());
        verify(fileStorageService, never()).store(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyString());
        verify(commentRepository).save(result);
    }

    @Test
    void createsCommentWithStoredImageUrl() {
        MockMultipartFile image = new MockMultipartFile(
                "image", "comment.png", "image/png", new byte[] {1, 2, 3});
        CreateCommentRequest request = request("Commentaire avec image", null);
        request.setImage(image);
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(fileStorageService.store(image, "comments"))
                .thenReturn("/uploads/comments/comment.png");
        when(commentRepository.save(org.mockito.ArgumentMatchers.any(Comment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Comment result = commentService.createComment(10L, request, author);

        assertEquals("/uploads/comments/comment.png", result.getImageUrl());
        verify(fileStorageService).store(image, "comments");
        verify(commentRepository).save(result);
    }

    @Test
    void rejectsTopLevelCommentOnAuthorsOwnWork() {
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));

        assertThrows(UnauthorizedActionException.class,
                () -> commentService.createComment(10L, request("Commentaire", null), owner));
    }

    @Test
    void allowsWorkAuthorToReplyToAnotherUsersCommentOnTheirWork() {
        Comment parent = new Comment();
        parent.setCommentId(15);
        parent.setOeuvre(oeuvre);
        parent.setUser(author);
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(commentRepository.findById(15)).thenReturn(Optional.of(parent));
        when(commentRepository.save(org.mockito.ArgumentMatchers.any(Comment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Comment reply = commentService.createComment(10L, request("Réponse", 15), owner);

        assertEquals(parent, reply.getParentComment());
        assertEquals(owner, reply.getUser());
    }

    @Test
    void rejectsUnknownParentComment() {
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(commentRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> commentService.createComment(10L, request("Réponse", 999), author));
    }

    @Test
    void rejectsParentCommentFromAnotherWork() {
        Oeuvre anotherWork = new Oeuvre();
        anotherWork.setOeuvreId(20L);
        Comment parent = new Comment();
        parent.setCommentId(15);
        parent.setOeuvre(anotherWork);
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.of(oeuvre));
        when(commentRepository.findById(15)).thenReturn(Optional.of(parent));

        assertThrows(IllegalArgumentException.class,
                () -> commentService.createComment(10L, request("Réponse", 15), author));
    }

    @Test
    void rejectsWhitespaceOnlyContent() {
        assertThrows(IllegalArgumentException.class,
                () -> commentService.createComment(10L, request("   ", null), author));
    }

    @Test
    void rejectsUnknownWork() {
        when(oeuvreRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> commentService.createComment(10L, request("Commentaire", null), author));
    }

    @Test
    void getsWorkCommentsAsPaginatedTreeWithAuthors() {
        Comment root1 = comment(1, "Commentaire 1", author, null);
        Comment reply = comment(2, "Réponse", owner, root1);
        Comment nestedReply = comment(3, "Réponse imbriquée", author, reply);
        Comment root2 = comment(4, "Commentaire 2", owner, null);
        Comment root3 = comment(5, "Commentaire 3", author, null);
        when(oeuvreRepository.existsById(10L)).thenReturn(true);
        when(commentRepository.findByOeuvreOeuvreIdOrderByCommentIdAsc(10L))
                .thenReturn(List.of(root1, reply, nestedReply, root2, root3));

        CommentPageResponse result = commentService.getCommentsByWork(10L, 1, 20);

        assertEquals(3, result.total());
        assertEquals(1, result.page());
        assertEquals(20, result.pageSize());
        assertEquals(3, result.items().size());
        assertEquals("Commentaire 1", result.items().get(0).getContent());
        assertEquals("author", result.items().get(0).getAuthor().username());
        assertEquals(1, result.items().get(0).getReplies().size());
        assertEquals("Réponse", result.items().get(0).getReplies().get(0).getContent());
        assertEquals("owner", result.items().get(0).getReplies().get(0).getAuthor().username());
        assertEquals("Réponse imbriquée",
                result.items().get(0).getReplies().get(0).getReplies().get(0).getContent());
    }

    @Test
    void rejectsListingCommentsForUnknownWork() {
        when(oeuvreRepository.existsById(10L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> commentService.getCommentsByWork(10L, 1, 20));
    }

    @Test
    void updatesCommentForItsAuthor() {
        Comment existing = comment(20, "Ancien contenu", author, null);
        UpdateCommentRequest request = updateRequest("  Nouveau contenu  ");
        when(commentRepository.findById(20)).thenReturn(Optional.of(existing));
        when(commentRepository.save(existing)).thenReturn(existing);

        var result = commentService.updateComment(20, request, author);

        assertEquals("Nouveau contenu", existing.getContent());
        assertEquals("Nouveau contenu", result.getContent());
        verify(commentRepository).save(existing);
    }

    @Test
    void rejectsUpdatingCommentByAnotherUser() {
        Comment existing = comment(20, "Ancien contenu", owner, null);
        when(commentRepository.findById(20)).thenReturn(Optional.of(existing));

        assertThrows(UnauthorizedActionException.class,
                () -> commentService.updateComment(20, updateRequest("Nouveau contenu"), author));
    }

    @Test
    void rejectsBlankUpdatedContent() {
        Comment existing = comment(20, "Ancien contenu", author, null);
        when(commentRepository.findById(20)).thenReturn(Optional.of(existing));

        assertThrows(IllegalArgumentException.class,
                () -> commentService.updateComment(20, updateRequest("  "), author));
    }

    @Test
    void rejectsUpdatingUnknownComment() {
        when(commentRepository.findById(20)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> commentService.updateComment(20, updateRequest("Nouveau contenu"), author));
    }

    @Test
    void deletesCommentForItsAuthor() {
        Comment existing = comment(20, "Contenu", author, null);
        when(commentRepository.findById(20)).thenReturn(Optional.of(existing));
        when(commentRepository.findByParentCommentCommentIdOrderByCommentIdAsc(20))
                .thenReturn(List.of());

        commentService.deleteComment(20, author);

        verify(commentRepository).delete(existing);
    }

    @Test
    void allowsAdminToDeleteAnotherUsersComment() {
        User admin = new User();
        admin.setUserId(3);
        admin.setAdmin(true);
        Comment existing = comment(20, "Contenu", author, null);
        when(commentRepository.findById(20)).thenReturn(Optional.of(existing));
        when(commentRepository.findByParentCommentCommentIdOrderByCommentIdAsc(20))
                .thenReturn(List.of());

        commentService.deleteComment(20, admin);

        verify(commentRepository).delete(existing);
    }

    @Test
    void rejectsDeletingCommentByAnotherNonAdminUser() {
        Comment existing = comment(20, "Contenu", owner, null);
        when(commentRepository.findById(20)).thenReturn(Optional.of(existing));

        assertThrows(UnauthorizedActionException.class,
                () -> commentService.deleteComment(20, author));
    }

    @Test
    void rejectsDeletingUnknownComment() {
        when(commentRepository.findById(20)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> commentService.deleteComment(20, author));
    }

    private CreateCommentRequest request(String content, Integer parentCommentId) {
        CreateCommentRequest request = new CreateCommentRequest();
        request.setContent(content);
        request.setParentCommentId(parentCommentId);
        return request;
    }

    private UpdateCommentRequest updateRequest(String content) {
        UpdateCommentRequest request = new UpdateCommentRequest();
        request.setContent(content);
        return request;
    }

    private Comment comment(int id, String content, User user, Comment parent) {
        Comment comment = new Comment();
        comment.setCommentId(id);
        comment.setOeuvre(oeuvre);
        comment.setUser(user);
        comment.setParentComment(parent);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now().plusSeconds(id));
        return comment;
    }
}
