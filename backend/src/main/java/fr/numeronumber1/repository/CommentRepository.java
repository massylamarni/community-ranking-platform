package fr.numeronumber1.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.numeronumber1.model.Comment;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
}
