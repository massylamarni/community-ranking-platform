package fr.numeronumber1.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fr.numeronumber1.dto.response.RankingItemResponse;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.Ranking;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.model.enums.PeriodType;
import fr.numeronumber1.repository.CategoryRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.RankingRepository;

@Service
public class RankingArchiveService {

    private final RankingRepository rankingRepository;
    private final OeuvreRepository oeuvreRepository;
    private final CategoryRepository categoryRepository;

    public RankingArchiveService(RankingRepository rankingRepository,
                                 OeuvreRepository oeuvreRepository,
                                 CategoryRepository categoryRepository) {
        this.rankingRepository = rankingRepository;
        this.oeuvreRepository = oeuvreRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Page<RankingItemResponse> getArchivedRanking(PeriodType periodType,
                                                        LocalDate periodStart,
                                                        Integer categoryId,
                                                        Pageable pageable) {
        PeriodType type = periodType != null ? periodType : PeriodType.week;
        LocalDate start = periodStart != null
                ? periodStart
                : rankingRepository.findLatestPeriodStart(type, categoryId);

        if (start == null) {
            start = rankingRepository.findLatestPeriodStart(type);
        }

        if (start == null) {
            return Page.empty(pageable);
        }

        Page<Ranking> page = rankingRepository.findArchived(type, start, categoryId, pageable);
        List<RankingItemResponse> items = page.getContent().stream()
                .map(r -> new RankingItemResponse(r.getOeuvre(), r.getScore(), (int) r.getRankPosition()))
                .toList();

        return new PageImpl<>(items, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<LocalDate> getArchivedPeriods(PeriodType periodType) {
        return rankingRepository.findDistinctPeriodStarts(periodType);
    }

    @Transactional
    public void createSnapshot(PeriodType periodType, LocalDate periodStart, Integer categoryId) {
        LocalDateTime startDateTime = periodStart.atStartOfDay();
        LocalDateTime endDateTime = switch (periodType) {
            case day -> startDateTime.plusDays(1);
            case week -> startDateTime.plusWeeks(1);
            case month -> startDateTime.plusMonths(1);
            case year -> startDateTime.plusYears(1);
        };

        Pageable top100 = PageRequest.of(0, 100);
        Page<Object[]> rows = (categoryId != null)
                ? oeuvreRepository.findRankingBetweenDatesAndCategory(OeuvreStatus.approved, categoryId, startDateTime, endDateTime, top100)
                : oeuvreRepository.findRankingBetweenDates(OeuvreStatus.approved, startDateTime, endDateTime, top100);

        Category category = categoryId != null ? categoryRepository.findById(categoryId).orElse(null) : null;

        List<Object[]> content = rows.getContent();
        for (int i = 0; i < content.size(); i++) {
            Object[] row = content.get(i);
            Oeuvre oeuvre = (Oeuvre) row[0];
            Number scoreNum = (Number) row[1];
            int score = scoreNum != null ? scoreNum.intValue() : 0;
            byte rankPosition = (byte) (i + 1);

            Ranking ranking = new Ranking();
            ranking.setPeriodType(periodType);
            ranking.setPeriodStart(periodStart);
            ranking.setRankPosition(rankPosition);
            ranking.setOeuvre(oeuvre);
            ranking.setScore(score);
            ranking.setCategory(category);

            rankingRepository.save(ranking);
        }
    }
}
