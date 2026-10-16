package fr.numeronumber1.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.numeronumber1.model.VoteHistory;

public interface VoteHistoryRepository extends JpaRepository<VoteHistory, Long> {
}
