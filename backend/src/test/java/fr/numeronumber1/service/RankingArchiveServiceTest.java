package fr.numeronumber1.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import fr.numeronumber1.dto.response.RankingItemResponse;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.Ranking;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.model.enums.PeriodType;
import fr.numeronumber1.repository.CategoryRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.RankingRepository;

@ExtendWith(MockitoExtension.class)
class RankingArchiveServiceTest {

    @Mock
    private RankingRepository rankingRepository;

    @Mock
    private OeuvreRepository oeuvreRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private RankingArchiveService rankingArchiveService;

    private User author;

    @BeforeEach
    void setUp() {
        author = new User();
        author.setUserId(1);
        author.setUsername("artist1");
    }

    private Oeuvre createOeuvre(Long id, String title) {
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(id);
        oeuvre.setTitle(title);
        oeuvre.setAuthor(author);
        oeuvre.setStatus(OeuvreStatus.approved);
        return oeuvre;
    }

    private Ranking createRanking(Oeuvre oeuvre, int score, byte position, LocalDate periodStart, PeriodType periodType) {
        Ranking ranking = new Ranking();
        ranking.setRankingId(1);
        ranking.setOeuvre(oeuvre);
        ranking.setScore(score);
        ranking.setRankPosition(position);
        ranking.setPeriodStart(periodStart);
        ranking.setPeriodType(periodType);
        return ranking;
    }

    @Test
    void getArchivedRanking_withDefaultPeriod_callsFindArchivedAndReturnsMappedPage() {
        Pageable pageable = PageRequest.of(0, 10);
        LocalDate start = LocalDate.of(2026, 9, 28);

        Oeuvre oeuvreB = createOeuvre(2L, "B");
        Oeuvre oeuvreA = createOeuvre(1L, "A");

        Ranking rankingB = createRanking(oeuvreB, 30, (byte) 1, start, PeriodType.week);
        Ranking rankingA = createRanking(oeuvreA, 20, (byte) 2, start, PeriodType.week);

        Page<Ranking> rankingPage = new PageImpl<>(List.of(rankingB, rankingA), pageable, 2);

        when(rankingRepository.findLatestPeriodStart(PeriodType.week, null)).thenReturn(start);
        when(rankingRepository.findArchived(PeriodType.week, start, null, pageable)).thenReturn(rankingPage);

        Page<RankingItemResponse> result = rankingArchiveService.getArchivedRanking(null, null, null, pageable);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals("B", result.getContent().get(0).getTitle());
        assertEquals(1, result.getContent().get(0).getPosition());
        assertEquals(30, result.getContent().get(0).getScore());
        assertEquals("A", result.getContent().get(1).getTitle());
        assertEquals(2, result.getContent().get(1).getPosition());
        assertEquals(20, result.getContent().get(1).getScore());

        verify(rankingRepository).findArchived(PeriodType.week, start, null, pageable);
    }

    @Test
    void getArchivedRanking_whenNoArchivesFound_returnsEmptyPage() {
        Pageable pageable = PageRequest.of(0, 10);

        when(rankingRepository.findLatestPeriodStart(PeriodType.week, null)).thenReturn(null);
        when(rankingRepository.findLatestPeriodStart(PeriodType.week)).thenReturn(null);

        Page<RankingItemResponse> result = rankingArchiveService.getArchivedRanking(PeriodType.week, null, null, pageable);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getArchivedPeriods_returnsListOfDates() {
        List<LocalDate> expectedDates = List.of(
                LocalDate.of(2026, 9, 28),
                LocalDate.of(2026, 9, 21)
        );

        when(rankingRepository.findDistinctPeriodStarts(PeriodType.week)).thenReturn(expectedDates);

        List<LocalDate> result = rankingArchiveService.getArchivedPeriods(PeriodType.week);

        assertEquals(2, result.size());
        assertEquals(expectedDates, result);
        verify(rankingRepository).findDistinctPeriodStarts(PeriodType.week);
    }

    @Test
    void createSnapshot_calculatesDatesAndSavesRankings() {
        LocalDate start = LocalDate.of(2026, 9, 28);
        Pageable top100 = PageRequest.of(0, 100);

        Oeuvre oeuvreB = createOeuvre(2L, "B");
        Oeuvre oeuvreA = createOeuvre(1L, "A");

        Object[] row1 = new Object[]{oeuvreB, 35};
        Object[] row2 = new Object[]{oeuvreA, 25};
        Page<Object[]> rows = new PageImpl<>(List.of(row1, row2), top100, 2);

        when(oeuvreRepository.findRankingBetweenDates(
                eq(OeuvreStatus.approved), any(LocalDateTime.class), any(LocalDateTime.class), eq(top100)))
                .thenReturn(rows);

        rankingArchiveService.createSnapshot(PeriodType.week, start, null);

        verify(rankingRepository, org.mockito.Mockito.times(2)).save(any(Ranking.class));
    }
}
