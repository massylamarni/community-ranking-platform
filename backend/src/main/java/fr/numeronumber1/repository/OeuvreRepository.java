package fr.numeronumber1.repository;

import fr.numeronumber1.model.Oeuvre;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OeuvreRepository extends JpaRepository<Oeuvre, Long> {
}
