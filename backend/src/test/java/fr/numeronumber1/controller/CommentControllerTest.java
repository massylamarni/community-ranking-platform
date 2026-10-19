package fr.numeronumber1.controller;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import fr.numeronumber1.dto.request.CreateCommentRequest;
import fr.numeronumber1.dto.request.UpdateCommentRequest;
import fr.numeronumber1.dto.response.CommentPageResponse;
import fr.numeronumber1.dto.response.CommentResponse;
import fr.numeronumber1.exception.GlobalExceptionHandler;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.exception.UnauthorizedActionException;
import fr.numeronumber1.model.Comment;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.security.SecurityConfig;
import fr.numeronumber1.service.CommentService;
import fr.numeronumber1.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@WebMvcTest(CommentController.class)
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CommentService commentService;

    @MockitoBean
    private UserService userService;

    @Test
    void listCommentsIsPublicAndReturnsPaginatedNestedResponse() throws Exception {
        User author = new User();
        author.setUserId(1);
        author.setUsername("alice");

        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(10L);

        Comment root = comment(1, "Commentaire racine", author, oeuvre, null);
        Comment reply = comment(2, "Réponse", author, oeuvre, root);
        CommentResponse rootResponse = new CommentResponse(
                root,
                List.of(new CommentResponse(reply)));
        when(commentService.getCommentsByWork(10L, 1, 20))
                .thenReturn(new CommentPageResponse(List.of(rootResponse), 1, 20, 1));

        mockMvc.perform(get("/works/10/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].content").value("Commentaire racine"))
                .andExpect(jsonPath("$.items[0].author.id").value(1))
                .andExpect(jsonPath("$.items[0].author.username").value("alice"))
                .andExpect(jsonPath("$.items[0].replies[0].content").value("Réponse"))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.pageSize").value(20))
                .andExpect(jsonPath("$.total").value(1));
    }

    @Test
    void createCommentRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/works/10/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Commentaire\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "alice")
    void createJsonCommentReturnsCreatedCommentWithAuthor() throws Exception {
        User author = new User();
        author.setUserId(1);
        author.setUsername("alice");
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(10L);
        Comment comment = comment(1, "Commentaire JSON", author, oeuvre, null);
        when(userService.findByUsername("alice")).thenReturn(author);
        when(commentService.createComment(eq(10L), any(CreateCommentRequest.class), eq(author)))
                .thenReturn(comment);

        mockMvc.perform(post("/works/10/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Commentaire JSON\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Commentaire JSON"))
                .andExpect(jsonPath("$.author.id").value(1))
                .andExpect(jsonPath("$.author.username").value("alice"));
    }

    @Test
    @WithMockUser(username = "alice")
    void createMultipartCommentStoresImageAndReturnsImageUrl() throws Exception {
        User author = new User();
        author.setUserId(1);
        author.setUsername("alice");
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(10L);
        Comment comment = comment(1, "Commentaire multipart", author, oeuvre, null);
        comment.setImageUrl("/uploads/comments/comment.png");
        when(userService.findByUsername("alice")).thenReturn(author);
        when(commentService.createComment(eq(10L), any(CreateCommentRequest.class), eq(author)))
                .thenReturn(comment);
        MockMultipartFile image = new MockMultipartFile(
                "image", "comment.png", "image/png", new byte[] {1, 2, 3});

        mockMvc.perform(multipart("/works/10/comments")
                        .file(image)
                        .param("content", "Commentaire multipart"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Commentaire multipart"))
                .andExpect(jsonPath("$.author.id").value(1))
                .andExpect(jsonPath("$.author.username").value("alice"))
                .andExpect(jsonPath("$.imageUrl").value("/uploads/comments/comment.png"));

        ArgumentCaptor<CreateCommentRequest> requestCaptor =
                ArgumentCaptor.forClass(CreateCommentRequest.class);
        verify(commentService).createComment(eq(10L), requestCaptor.capture(), eq(author));
        org.junit.jupiter.api.Assertions.assertEquals(
                "comment.png", requestCaptor.getValue().getImage().getOriginalFilename());
    }

    @Test
    @WithMockUser(username = "alice")
    void updateCommentReturnsUpdatedComment() throws Exception {
        User author = user("alice", 1);
        Comment updated = comment(1, "Contenu modifié", author, work(10L), null);
        when(userService.findByUsername("alice")).thenReturn(author);
        when(commentService.updateComment(eq(1), any(UpdateCommentRequest.class), eq(author)))
                .thenReturn(new CommentResponse(updated));

        mockMvc.perform(patch("/comments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Contenu modifié\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Contenu modifié"))
                .andExpect(jsonPath("$.author.id").value(1))
                .andExpect(jsonPath("$.author.username").value("alice"));
    }

    @Test
    @WithMockUser(username = "alice")
    void updateMultipartCommentPassesImageAndReturnsUpdatedImageUrl() throws Exception {
        User author = user("alice", 1);
        Comment updated = comment(1, "Contenu modifié", author, work(10L), null);
        updated.setImageUrl("/uploads/comments/updated.png");
        when(userService.findByUsername("alice")).thenReturn(author);
        when(commentService.updateComment(eq(1), any(UpdateCommentRequest.class), eq(author)))
                .thenReturn(new CommentResponse(updated));
        MockMultipartFile image = new MockMultipartFile(
                "image", "updated.png", "image/png", new byte[] {1, 2, 3});

        mockMvc.perform(multipart("/comments/1")
                        .file(image)
                        .param("content", "Contenu modifié")
                        .with(request -> {
                            request.setMethod("PATCH");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Contenu modifié"))
                .andExpect(jsonPath("$.imageUrl").value("/uploads/comments/updated.png"));

        ArgumentCaptor<UpdateCommentRequest> requestCaptor =
                ArgumentCaptor.forClass(UpdateCommentRequest.class);
        verify(commentService).updateComment(eq(1), requestCaptor.capture(), eq(author));
        org.junit.jupiter.api.Assertions.assertEquals(
                "updated.png", requestCaptor.getValue().getImage().getOriginalFilename());
    }

    @Test
    @WithMockUser(username = "alice")
    void updateCommentRejectsMalformedJson() throws Exception {
        mockMvc.perform(patch("/comments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "alice")
    void updateCommentRejectsBlankContent() throws Exception {
        mockMvc.perform(patch("/comments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"  \"}"))
                .andExpect(status().is(422))
                .andExpect(jsonPath("$.fields.content").exists());
    }

    @Test
    void updateCommentRequiresAuthentication() throws Exception {
        mockMvc.perform(patch("/comments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Contenu modifié\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "bob")
    void updateCommentRejectsForbiddenUser() throws Exception {
        User currentUser = user("bob", 2);
        when(userService.findByUsername("bob")).thenReturn(currentUser);
        when(commentService.updateComment(eq(1), any(UpdateCommentRequest.class), eq(currentUser)))
                .thenThrow(new UnauthorizedActionException(
                        "Vous n'êtes pas autorisé à modifier ce commentaire."));

        mockMvc.perform(patch("/comments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Contenu modifié\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value(
                        "Vous n'êtes pas autorisé à modifier ce commentaire."));
    }

    @Test
    @WithMockUser(username = "alice")
    void updateCommentReturnsNotFoundForUnknownComment() throws Exception {
        User author = user("alice", 1);
        when(userService.findByUsername("alice")).thenReturn(author);
        when(commentService.updateComment(eq(1), any(UpdateCommentRequest.class), eq(author)))
                .thenThrow(new ResourceNotFoundException("Commentaire introuvable"));

        mockMvc.perform(patch("/comments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Contenu modifié\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "alice")
    void deleteCommentReturnsNoContentForAuthor() throws Exception {
        User author = user("alice", 1);
        when(userService.findByUsername("alice")).thenReturn(author);

        mockMvc.perform(delete("/comments/1"))
                .andExpect(status().isNoContent());

        verify(commentService).deleteComment(1, author);
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void deleteCommentReturnsNoContentForAdmin() throws Exception {
        User admin = user("admin", 3);
        admin.setAdmin(true);
        when(userService.findByUsername("admin")).thenReturn(admin);

        mockMvc.perform(delete("/comments/1"))
                .andExpect(status().isNoContent());

        verify(commentService).deleteComment(1, admin);
    }

    @Test
    void deleteCommentRequiresAuthentication() throws Exception {
        mockMvc.perform(delete("/comments/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "bob")
    void deleteCommentRejectsForbiddenUser() throws Exception {
        User currentUser = user("bob", 2);
        when(userService.findByUsername("bob")).thenReturn(currentUser);
        doThrow(new UnauthorizedActionException(
                "Vous n'êtes pas autorisé à supprimer ce commentaire."))
                .when(commentService).deleteComment(1, currentUser);

        mockMvc.perform(delete("/comments/1"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value(
                        "Vous n'êtes pas autorisé à supprimer ce commentaire."));
    }

    @Test
    @WithMockUser(username = "alice")
    void deleteCommentReturnsNotFoundForUnknownComment() throws Exception {
        User author = user("alice", 1);
        when(userService.findByUsername("alice")).thenReturn(author);
        doThrow(new ResourceNotFoundException("Commentaire introuvable"))
                .when(commentService).deleteComment(1, author);

        mockMvc.perform(delete("/comments/1"))
                .andExpect(status().isNotFound());
    }

    private Comment comment(int id, String content, User author, Oeuvre oeuvre, Comment parent) {
        Comment comment = new Comment();
        comment.setCommentId(id);
        comment.setContent(content);
        comment.setUser(author);
        comment.setOeuvre(oeuvre);
        comment.setParentComment(parent);
        comment.setCreatedAt(LocalDateTime.now().plusSeconds(id));
        return comment;
    }

    private User user(String username, int id) {
        User user = new User();
        user.setUserId(id);
        user.setUsername(username);
        return user;
    }

    private Oeuvre work(Long id) {
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(id);
        return oeuvre;
    }
}
