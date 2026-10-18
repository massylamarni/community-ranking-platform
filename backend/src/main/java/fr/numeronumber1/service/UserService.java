package fr.numeronumber1.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import fr.numeronumber1.dto.response.PublicProfileResponse;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.model.Comment;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.CommentRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.VoteRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import fr.numeronumber1.exception.EmailAlreadyExistsException;
import fr.numeronumber1.exception.UsernameAlreadyExistsException;
import fr.numeronumber1.model.User;
import fr.numeronumber1.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final OeuvreRepository oeuvreRepository;
    private final CommentRepository commentRepository;
    private final VoteRepository voteRepository;


    public UserService(
            UserRepository userRepository,
            OeuvreRepository oeuvreRepository,
            CommentRepository commentRepository,
            VoteRepository voteRepository) {
        this.userRepository = userRepository;
        this.oeuvreRepository = oeuvreRepository;
        this.commentRepository = commentRepository;
        this.voteRepository = voteRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + username));
        List<SimpleGrantedAuthority> authorities = user.isAdmin()
                ? List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_USER"))
                : List.of(new SimpleGrantedAuthority("ROLE_USER"));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                authorities
        );
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur introuvable : " + username));
    }
    
    @Transactional
    public User updateProfile(String currentUsername, String newUsername, String newEmail) {
        User user = findByUsername(currentUsername);

        String finalUsername = (newUsername == null || newUsername.isBlank()) ? currentUsername : newUsername;
        String finalEmail = (newEmail == null || newEmail.isBlank()) ? user.getEmail() : newEmail;

        if (!currentUsername.equals(finalUsername) && userRepository.existsByUsername(finalUsername)) {
            throw new UsernameAlreadyExistsException("Nom d'utilisateur déjà enregistré");
        }

        if (!user.getEmail().equals(finalEmail) && userRepository.existsByEmail(finalEmail)) {
            throw new EmailAlreadyExistsException("Email déjà enregistré");
        }

        user.setUsername(finalUsername);
        user.setEmail(finalEmail);
        return userRepository.save(user);
    }

    public PublicProfileResponse getPublicProfile(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Utilisateur introuvable"));

        List<Map<String, Object>> publishedWorks =
                getPublishedWorks(user);

        List<Map<String, Object>> comments =
                getUserComments(userId);

        List<Map<String, Object>> votedWorks =
                getVotedWorks(userId);

        return new PublicProfileResponse(
                user.getUserId(),
                user.getUsername(),
                publishedWorks,
                comments,
                votedWorks
        );
    }

    private List<Map<String, Object>> getPublishedWorks(User user) {
        List<Map<String, Object>> result = new ArrayList<>();

        List<Oeuvre> works = oeuvreRepository.findByAuthorUserIdAndStatus(
                user.getUserId(),
                OeuvreStatus.approved
        );

        for (Oeuvre oeuvre : works) {
            Map<String, Object> item = new LinkedHashMap<>();

            item.put("oeuvreId", oeuvre.getOeuvreId());
            item.put("title", oeuvre.getTitle());
            item.put("description", oeuvre.getDescription());
            item.put("imageUrl", oeuvre.getImageUrl());
            item.put("score", oeuvre.getScore());
            item.put("totalVotes", oeuvre.getVotes().size());
            item.put("createdAt", oeuvre.getCreatedAt());

            result.add(item);
        }

        return result;
    }
    private List<Map<String, Object>> getUserComments(Integer userId) {

        List<Map<String, Object>> result = new ArrayList<>();

        List<Comment> userComments = commentRepository.findByUserUserIdOrderByCreatedAtDesc(userId);

        for (Comment comment : userComments) {

            Oeuvre oeuvre = comment.getOeuvre();

            if (oeuvre == null
                    || oeuvre.getStatus() == null
                    || !oeuvre.getStatus().name().equalsIgnoreCase("approved")) {
                continue;
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("commentId", comment.getCommentId());
            item.put("content", comment.getContent());
            item.put("imageUrl", comment.getImageUrl());
            item.put("createdAt", comment.getCreatedAt());
            item.put("oeuvreId", oeuvre.getOeuvreId());
            item.put("oeuvreTitle", oeuvre.getTitle());

            if (comment.getParentComment() != null) {
                item.put("parentCommentId",
                        comment.getParentComment().getCommentId());
            } else {
                item.put("parentCommentId", null);
            }

            result.add(item);
        }

        return result;
    }

    private List<Map<String, Object>> getVotedWorks(Integer userId) {

        List<Map<String, Object>> result = new ArrayList<>();

        List<Vote> votes = voteRepository.findByUserUserId(userId);

        for (Vote vote : votes) {

            Oeuvre oeuvre = vote.getOeuvre();
            if (oeuvre == null
                    || oeuvre.getStatus() == null
                    || !oeuvre.getStatus().name().equalsIgnoreCase("approved")) {
                continue;
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("oeuvreId", oeuvre.getOeuvreId());
            item.put("title", oeuvre.getTitle());
            item.put("imageUrl", oeuvre.getImageUrl());
            item.put("score", oeuvre.getScore());
            item.put("totalVotes", oeuvre.getVotes().size());
            item.put("voteValue", vote.getValue());
            result.add(item);
        }

        return result;
    }
}
