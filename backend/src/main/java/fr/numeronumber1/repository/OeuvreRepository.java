package fr.numeronumber1.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.numeronumber1.model.Oeuvre;

public interface OeuvreRepository extends JpaRepository<Oeuvre, Long> {
    boolean existsByTitle(String title);
}
