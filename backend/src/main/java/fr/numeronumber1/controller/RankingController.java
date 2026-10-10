package fr.numeronumber1.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fr.numeronumber1.dto.response.RankingItemResponse;
import fr.numeronumber1.service.RankingService;

@RestController
@RequestMapping("/rankings")
public class RankingController {

    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
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
}

