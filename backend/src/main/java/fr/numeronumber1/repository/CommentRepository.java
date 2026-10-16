package fr.numeronumber1.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.numeronumber1.model.Comment;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByOeuvreOeuvreIdOrderByCommentIdAsc(Long oeuvreId);

    List<Comment> findByParentCommentCommentIdOrderByCommentIdAsc(Integer parentCommentId);
    List<Comment> findByUserUserIdOrderByCreatedAtDesc(Integer userId);
}
