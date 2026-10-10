package fr.numeronumber1.repository;

import fr.numeronumber1.model.Ranking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RankingRepository extends JpaRepository<Ranking, Integer> {
}
