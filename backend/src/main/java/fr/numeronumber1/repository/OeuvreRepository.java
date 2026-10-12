package fr.numeronumber1.repository;

import fr.numeronumber1.model.enums.OeuvreStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fr.numeronumber1.model.Oeuvre;

public interface OeuvreRepository extends JpaRepository<Oeuvre, Long>, JpaSpecificationExecutor<Oeuvre> {
    boolean existsByTitle(String title);
    Page<Oeuvre> findByStatus(OeuvreStatus status, Pageable pageable);

    boolean existsByTitleAndOeuvreIdNot(String title, Long oeuvreId);

    Page<Oeuvre> findByStatusOrderByScoreDesc(OeuvreStatus status, Pageable pageable);

    @Query(value = "SELECT o FROM Oeuvre o JOIN o.oeuvreCategories oc WHERE o.status = :status AND oc.category.categoryId = :categoryId ORDER BY o.score DESC",
           countQuery = "SELECT count(o) FROM Oeuvre o JOIN o.oeuvreCategories oc WHERE o.status = :status AND oc.category.categoryId = :categoryId")
    Page<Oeuvre> findByStatusAndCategoryIdOrderByScoreDesc(
            @Param("status") OeuvreStatus status,
            @Param("categoryId") Integer categoryId,
            Pageable pageable);
}

