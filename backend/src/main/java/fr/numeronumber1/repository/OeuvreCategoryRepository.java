package fr.numeronumber1.repository;

import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.OeuvreCategory;
import fr.numeronumber1.model.enums.OeuvreStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import fr.numeronumber1.model.OeuvreCategoryId;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OeuvreCategoryRepository extends JpaRepository<OeuvreCategory, OeuvreCategoryId> {

    @Query("""
    SELECT oc.oeuvre
    FROM OeuvreCategory oc
    WHERE oc.category.categoryId = :categoryId
      AND oc.oeuvre.status = :status
""")
    Page<Oeuvre> findPublishedWorksByCategory(
            @Param("categoryId") Integer categoryId,
            @Param("status") OeuvreStatus status,
            Pageable pageable
    );
}
