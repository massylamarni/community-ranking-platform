package fr.numeronumber1.repository;

import fr.numeronumber1.model.enums.OeuvreStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import fr.numeronumber1.model.Oeuvre;

public interface OeuvreRepository extends JpaRepository<Oeuvre, Long>, JpaSpecificationExecutor<Oeuvre> {
    boolean existsByTitle(String title);
    Page<Oeuvre> findByStatus(OeuvreStatus status, Pageable pageable);

    boolean existsByTitleAndOeuvreIdNot(String title, Long oeuvreId);
}
