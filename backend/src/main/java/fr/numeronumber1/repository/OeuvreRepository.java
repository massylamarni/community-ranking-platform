package fr.numeronumber1.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.enums.OeuvreStatus;

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

    @Query(value = "SELECT o, COALESCE(SUM(CASE WHEN v.createdAt >= :startDate THEN v.value ELSE 0 END), 0) " +
                   "FROM Oeuvre o LEFT JOIN o.votes v " +
                   "WHERE o.status = :status " +
                   "GROUP BY o " +
                   "ORDER BY COALESCE(SUM(CASE WHEN v.createdAt >= :startDate THEN v.value ELSE 0 END), 0) DESC",
           countQuery = "SELECT count(o) FROM Oeuvre o WHERE o.status = :status")
    Page<Object[]> findRankingByPeriod(
            @Param("status") OeuvreStatus status,
            @Param("startDate") LocalDateTime startDate,
            Pageable pageable);

    @Query(value = "SELECT o, COALESCE(SUM(CASE WHEN v.createdAt >= :startDate THEN v.value ELSE 0 END), 0) " +
                   "FROM Oeuvre o JOIN o.oeuvreCategories oc LEFT JOIN o.votes v " +
                   "WHERE o.status = :status AND oc.category.categoryId = :categoryId " +
                   "GROUP BY o " +
                   "ORDER BY COALESCE(SUM(CASE WHEN v.createdAt >= :startDate THEN v.value ELSE 0 END), 0) DESC",
           countQuery = "SELECT count(o) FROM Oeuvre o JOIN o.oeuvreCategories oc WHERE o.status = :status AND oc.category.categoryId = :categoryId")
    Page<Object[]> findRankingByPeriodAndCategory(
            @Param("status") OeuvreStatus status,
            @Param("categoryId") Integer categoryId,
            @Param("startDate") LocalDateTime startDate,
            Pageable pageable);
}

