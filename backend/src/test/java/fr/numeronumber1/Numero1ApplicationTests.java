package fr.numeronumber1;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.VoteHistory;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.UserRepository;
import fr.numeronumber1.repository.VoteHistoryRepository;

@SpringBootTest
class Numero1ApplicationTests {

	@Autowired
	private OeuvreRepository oeuvreRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private VoteHistoryRepository voteHistoryRepository;

	@Test
	void contextLoads() {
	}

	@Test
	@Transactional
	void archivedRankingUsesVoteStateAtPeriodEnd() {
		User author = new User();
		author.setUsername("archive-test-author");
		author.setEmail("archive-test-author@example.com");
		author.setPasswordHash("test");
		author.setCreatedAt(LocalDateTime.now());
		author = userRepository.saveAndFlush(author);

		Oeuvre changedVote = createApprovedWork(author, "changed");
		Oeuvre removedDuringPeriod = createApprovedWork(author, "removed-during");
		Oeuvre oldVote = createApprovedWork(author, "old");
		Oeuvre removedAfterPeriod = createApprovedWork(author, "removed-after");

		addVoteEvent(changedVote, 1, 1, 9, 2);
		addVoteEvent(changedVote, 1, -1, 9, 3);
		addVoteEvent(changedVote, 1, null, 9, 9);

		addVoteEvent(removedDuringPeriod, 2, 1, 9, 3);
		addVoteEvent(removedDuringPeriod, 2, null, 9, 4);

		addVoteEvent(oldVote, 3, 1, 8, 31);

		addVoteEvent(removedAfterPeriod, 4, 1, 9, 5);
		addVoteEvent(removedAfterPeriod, 4, null, 9, 9);
		voteHistoryRepository.flush();

		Page<Object[]> page = oeuvreRepository.findRankingBetweenDates(
				OeuvreStatus.approved,
				LocalDateTime.of(2026, 9, 1, 0, 0),
				LocalDateTime.of(2026, 9, 8, 0, 0),
				PageRequest.of(0, 10));

		Map<String, Integer> scores = page.getContent().stream()
				.collect(Collectors.toMap(
						row -> ((Oeuvre) row[0]).getTitle(),
						row -> ((Number) row[1]).intValue()));

		assertEquals(4, scores.size());
		assertEquals(-1, scores.get("changed"));
		assertEquals(0, scores.get("removed-during"));
		assertEquals(0, scores.get("old"));
		assertEquals(1, scores.get("removed-after"));
	}

	private Oeuvre createApprovedWork(User author, String title) {
		Oeuvre oeuvre = new Oeuvre();
		oeuvre.setTitle(title);
		oeuvre.setAuthor(author);
		oeuvre.setStatus(OeuvreStatus.approved);
		return oeuvreRepository.saveAndFlush(oeuvre);
	}

	private void addVoteEvent(Oeuvre oeuvre, int voteId, Integer value, int month, int day) {
		VoteHistory event = new VoteHistory();
		event.setVoteId(voteId);
		event.setOeuvre(oeuvre);
		event.setUserId(100 + voteId);
		event.setValue(value);
		event.setEventAt(LocalDateTime.of(2026, month, day, 12, 0));
		voteHistoryRepository.save(event);
	}
}
