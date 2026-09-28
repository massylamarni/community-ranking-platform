package fr.numeronumber1.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import fr.numeronumber1.model.Oeuvre;

public interface OeuvreRepository extends JpaRepository<Oeuvre, Long>, JpaSpecificationExecutor<Oeuvre> {
    boolean existsByTitle(String title);
    boolean existsByTitleAndOeuvreIdNot(String title, Long oeuvreId);
}
