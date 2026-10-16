package fr.numeronumber1.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fr.numeronumber1.dto.response.RankingItemResponse;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.OeuvreRepository;

@Service
public class RankingService {

    private final OeuvreRepository oeuvreRepository;

    public RankingService(OeuvreRepository oeuvreRepository) {
        this.oeuvreRepository = oeuvreRepository;
    }

    @Transactional(readOnly = true)
    public Page<RankingItemResponse> getRanking(Integer categoryId, String period, Pageable pageable) {
        LocalDateTime startDate = resolvePeriodStartDate(period);
        int startPosition = pageable.getPageNumber() * pageable.getPageSize() + 1;
        List<RankingItemResponse> items = new ArrayList<>();

        if (startDate != null) {
            Page<Object[]> periodPage = (categoryId != null)
                    ? oeuvreRepository.findRankingByPeriodAndCategory(OeuvreStatus.approved, categoryId, startDate, pageable)
                    : oeuvreRepository.findRankingByPeriod(OeuvreStatus.approved, startDate, pageable);

            List<Object[]> rows = periodPage.getContent();
            for (int i = 0; i < rows.size(); i++) {
                Object[] row = rows.get(i);
                Oeuvre oeuvre = (Oeuvre) row[0];
                Number scoreNum = (Number) row[1];
                int score = scoreNum != null ? scoreNum.intValue() : 0;
                int position = startPosition + i;
                items.add(new RankingItemResponse(oeuvre, score, position));
            }
            return new PageImpl<>(items, pageable, periodPage.getTotalElements());
        }

        Page<Oeuvre> page = (categoryId != null)
                ? oeuvreRepository.findByStatusAndCategoryIdOrderByScoreDesc(OeuvreStatus.approved, categoryId, pageable)
                : oeuvreRepository.findByStatusOrderByScoreDesc(OeuvreStatus.approved, pageable);

        List<Oeuvre> oeuvres = page.getContent();
        for (int i = 0; i < oeuvres.size(); i++) {
            Oeuvre oeuvre = oeuvres.get(i);
            int position = startPosition + i;
            items.add(new RankingItemResponse(oeuvre, oeuvre.getScore(), position));
        }

        return new PageImpl<>(items, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<RankingItemResponse> getRanking(Integer categoryId, Pageable pageable) {
        return getRanking(categoryId, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<RankingItemResponse> getGlobalRanking(Pageable pageable) {
        return getRanking(null, null, pageable);
    }

    private LocalDateTime resolvePeriodStartDate(String period) {
        if (period == null || period.isBlank() || period.equalsIgnoreCase("all")) {
            return null;
        }
        String p = period.trim().toLowerCase();
        return switch (p) {
            case "day", "jour" -> LocalDate.now().atStartOfDay();
            case "week", "semaine" -> LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
            case "month", "mois" -> LocalDate.now().withDayOfMonth(1).atStartOfDay();
            default -> null;
        };
    }
}


