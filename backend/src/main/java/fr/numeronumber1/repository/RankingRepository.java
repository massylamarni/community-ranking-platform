package fr.numeronumber1.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fr.numeronumber1.model.Ranking;
import fr.numeronumber1.model.enums.PeriodType;

public interface RankingRepository extends JpaRepository<Ranking, Integer> {

    @Query("SELECT r FROM Ranking r WHERE r.periodType = :periodType AND r.periodStart = :periodStart " +
           "AND ((:categoryId IS NOT NULL AND r.category.categoryId = :categoryId) " +
           "     OR (:categoryId IS NULL AND r.category IS NULL)) " +
           "ORDER BY r.rankPosition ASC")
    Page<Ranking> findArchived(
            @Param("periodType") PeriodType periodType,
            @Param("periodStart") LocalDate periodStart,
            @Param("categoryId") Integer categoryId,
            Pageable pageable);

    @Query("SELECT MAX(r.periodStart) FROM Ranking r WHERE r.periodType = :periodType " +
           "AND ((:categoryId IS NOT NULL AND r.category.categoryId = :categoryId) " +
           "     OR (:categoryId IS NULL AND r.category IS NULL))")
    LocalDate findLatestPeriodStart(
            @Param("periodType") PeriodType periodType,
            @Param("categoryId") Integer categoryId);

    @Query("SELECT MAX(r.periodStart) FROM Ranking r WHERE r.periodType = :periodType")
    LocalDate findLatestPeriodStart(@Param("periodType") PeriodType periodType);

    @Query("SELECT DISTINCT r.periodStart FROM Ranking r WHERE (:periodType IS NULL OR r.periodType = :periodType) ORDER BY r.periodStart DESC")
    List<LocalDate> findDistinctPeriodStarts(@Param("periodType") PeriodType periodType);

    boolean existsByPeriodTypeAndPeriodStartAndCategoryIsNull(PeriodType periodType, LocalDate periodStart);

    boolean existsByPeriodTypeAndPeriodStartAndCategory_CategoryId(PeriodType periodType, LocalDate periodStart, Integer categoryId);
}
