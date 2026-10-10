package fr.numeronumber1.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fr.numeronumber1.dto.response.RankingItemResponse;
import fr.numeronumber1.model.enums.PeriodType;
import fr.numeronumber1.service.RankingArchiveService;
import fr.numeronumber1.service.RankingService;

@RestController
@RequestMapping("/rankings")
public class RankingController {

    private final RankingService rankingService;
    private final RankingArchiveService rankingArchiveService;

    public RankingController(RankingService rankingService, RankingArchiveService rankingArchiveService) {
        this.rankingService = rankingService;
        this.rankingArchiveService = rankingArchiveService;
    }

    @GetMapping
    public ResponseEntity<Page<RankingItemResponse>> getRankings(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String period,
            Pageable pageable) {
        Page<RankingItemResponse> page = (period != null && !period.isBlank())
                ? rankingService.getRanking(categoryId, period, pageable)
                : rankingService.getRanking(categoryId, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/global")
    public ResponseEntity<Page<RankingItemResponse>> getGlobalRanking(Pageable pageable) {
        Page<RankingItemResponse> page = rankingService.getGlobalRanking(pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/archives")
    public ResponseEntity<Page<RankingItemResponse>> getArchivedRankings(
            @RequestParam(required = false) PeriodType periodType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam(required = false) Integer categoryId,
            Pageable pageable) {
        if (rankingArchiveService == null) {
            return ResponseEntity.ok(Page.empty(pageable));
        }
        Page<RankingItemResponse> page = rankingArchiveService.getArchivedRanking(periodType, periodStart, categoryId, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/archives/periods")
    public ResponseEntity<List<LocalDate>> getArchivedPeriods(
            @RequestParam(required = false) PeriodType periodType) {
        if (rankingArchiveService == null) {
            return ResponseEntity.ok(List.of());
        }
        List<LocalDate> periods = rankingArchiveService.getArchivedPeriods(periodType);
        return ResponseEntity.ok(periods);
    }
}
