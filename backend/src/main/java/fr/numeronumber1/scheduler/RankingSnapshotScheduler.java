package fr.numeronumber1.scheduler;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import fr.numeronumber1.model.enums.PeriodType;
import fr.numeronumber1.service.RankingArchiveService;

@Component
public class RankingSnapshotScheduler {

    private final RankingArchiveService rankingArchiveService;

    public RankingSnapshotScheduler(RankingArchiveService rankingArchiveService) {
        this.rankingArchiveService = rankingArchiveService;
    }

    // Every Monday at midnight: archive the previous week
    @Scheduled(cron = "0 0 0 * * MON")
    public void archiveWeeklyRanking() {
        LocalDate lastMonday = LocalDate.now().minusWeeks(1).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        rankingArchiveService.createSnapshot(PeriodType.week, lastMonday, null);
    }

    // On the 1st of every month at midnight: archive the previous month
    @Scheduled(cron = "0 0 0 1 * *")
    public void archiveMonthlyRanking() {
        LocalDate firstOfLastMonth = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        rankingArchiveService.createSnapshot(PeriodType.month, firstOfLastMonth, null);
    }

    // Every day at midnight: archive yesterday
    @Scheduled(cron = "0 0 0 * * *")
    public void archiveDailyRanking() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        rankingArchiveService.createSnapshot(PeriodType.day, yesterday, null);
    }
}
