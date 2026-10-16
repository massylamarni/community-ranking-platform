package fr.numeronumber1.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.numeronumber1.model.Comment;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByOeuvreOeuvreIdOrderByCommentIdAsc(Long oeuvreId);

    List<Comment> findByParentCommentCommentIdOrderByCommentIdAsc(Integer parentCommentId);
}
