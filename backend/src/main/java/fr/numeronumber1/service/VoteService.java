package fr.numeronumber1.service;

import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.exception.UnauthorizedActionException;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.VoteRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final OeuvreRepository oeuvreRepository;

    public VoteService(
            VoteRepository voteRepository,
            OeuvreRepository oeuvreRepository) {
        this.voteRepository = voteRepository;
        this.oeuvreRepository = oeuvreRepository;
    }

    public Vote createVote(Long oeuvreId, byte value, User user) {

        Oeuvre oeuvre = oeuvreRepository.findById(oeuvreId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Œuvre introuvable"));

        if (oeuvre.getAuthor().getUserId().equals(user.getUserId())) {
            throw new UnauthorizedActionException(
                    "Vous ne pouvez pas voter pour votre propre œuvre");
        }

        if (voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(
                        oeuvreId,
                        user.getUserId())
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Vous avez déjà voté pour cette œuvre");
        }

        if (value != 1 && value != -1) {
            throw new IllegalArgumentException(
                    "La valeur du vote doit être 1 ou -1");
        }

        Vote vote = new Vote();
        vote.setOeuvre(oeuvre);
        vote.setUser(user);
        vote.setValue(value);
        vote.setCreatedAt(LocalDateTime.now());

        return voteRepository.save(vote);
    }


    public Vote updateVote(Long oeuvreId, byte value, User user) {

        if (value != 1 && value != -1) {
            throw new IllegalArgumentException(
                    "La valeur du vote doit être 1 ou -1");
        }

        Vote vote = voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(
                        oeuvreId,
                        user.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Vous n'avez pas encore voté pour cette œuvre"));

        vote.setValue(value);

        return voteRepository.save(vote);
    }

    public void deleteVote(Long oeuvreId, User user) {

        Vote vote = voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(
                        oeuvreId,
                        user.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Vous n'avez pas encore voté pour cette œuvre"));

        voteRepository.delete(vote);
    }

    public List<Vote> getMyVotes(User user) {

        return voteRepository.findByUserUserId(
                user.getUserId());
    }

    public int getScore(Long oeuvreId) {

        long positiveVotes =
                voteRepository.countByOeuvreOeuvreIdAndValue(
                        oeuvreId,
                        (byte) 1);

        long negativeVotes =
                voteRepository.countByOeuvreOeuvreIdAndValue(
                        oeuvreId,
                        (byte) -1);

        return (int) (positiveVotes - negativeVotes);
    }
}