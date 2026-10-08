package fr.numeronumber1.repository;

import fr.numeronumber1.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Integer> {

    Optional<Vote> findByOeuvreOeuvreIdAndUserUserId(Long oeuvreId, Integer userId);

    List<Vote> findByUserUserId(Integer userId);

    long countByOeuvreOeuvreIdAndValue(Long oeuvreId, byte value);
}