package fr.numeronumber1.service;
import fr.numeronumber1.dto.request.VoteRequest;
import fr.numeronumber1.dto.response.UserVoteResponse;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.exception.UnauthorizedActionException;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.VoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    @Transactional
    public Vote createVote(Long oeuvreId, VoteRequest request, User user) {

        Oeuvre oeuvre = oeuvreRepository.findById(oeuvreId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Œuvre introuvable"));

        if (oeuvre.getAuthor().getUserId().equals(user.getUserId())) {
            throw new UnauthorizedActionException(
                    "Vous ne pouvez pas voter pour votre propre œuvre");
        }

        if (voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(
                        oeuvreId, user.getUserId())
                .isPresent()) {
            throw new IllegalArgumentException(
                    "Vous avez déjà voté pour cette œuvre");
        }

        byte value = convertVoteType(request.getType());

        Vote vote = new Vote();
        vote.setOeuvre(oeuvre);
        vote.setUser(user);
        vote.setValue(value);
        vote.setCreatedAt(LocalDateTime.now());

        Vote savedVote = voteRepository.save(vote);

        recalculerScore(oeuvre);

        return savedVote;
    }

    @Transactional
    public Vote updateVote(Long oeuvreId, VoteRequest request, User user) {

        Vote vote = voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(
                        oeuvreId, user.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Vous n'avez pas encore voté pour cette œuvre"));

        byte value = convertVoteType(request.getType());

        vote.setValue(value);

        Vote updatedVote = voteRepository.save(vote);

        recalculerScore(vote.getOeuvre());

        return updatedVote;
    }


    @Transactional(readOnly = true)
    public List<UserVoteResponse> getMyVotes(User user) {

        return voteRepository.findByUserUserId(user.getUserId())
                .stream()
                .map(UserVoteResponse::new)
                .toList();
    }


    @Transactional(readOnly = true)
    public int getScore(Long oeuvreId) {

        long positiveVotes =
                voteRepository.countByOeuvreOeuvreIdAndValue(
                        oeuvreId, (byte) 1);

        long negativeVotes =
                voteRepository.countByOeuvreOeuvreIdAndValue(
                        oeuvreId, (byte) -1);

        return (int) (positiveVotes - negativeVotes);
    }


    @Transactional
    public Oeuvre vote(Long workId, VoteRequest request, User user) {
        Oeuvre oeuvre = oeuvreRepository.findById(workId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Œuvre introuvable."));

        if (oeuvre.getAuthor().getUserId().equals(user.getUserId())) {
            throw new UnauthorizedActionException(
                    "Vous ne pouvez pas voter pour votre propre œuvre.");
        }

        Integer value = request.value();

        if (value != null && value != 1 && value != -1) {
            throw new InvalidVoteValueException(
                    "La valeur du vote est invalide.");
        }

        Optional<Vote> existingVote =
                voteRepository.findByOeuvreOeuvreIdAndUserUserId(
                        workId, user.getUserId());

        if (value == null) {
            existingVote.ifPresent(voteRepository::delete);
        } else if (existingVote.isPresent()) {
            Vote vote = existingVote.get();
            vote.setValue(value.byteValue());
            voteRepository.save(vote);
        } else {
            Vote vote = new Vote();
            vote.setOeuvre(oeuvre);
            vote.setUser(user);
            vote.setValue(value.byteValue());
            vote.setCreatedAt(LocalDateTime.now());
            voteRepository.save(vote);
        }

        recalculerScore(oeuvre);

        return oeuvreRepository.save(oeuvre);
    }

    private void recalculerScore(Oeuvre oeuvre) {
        long positifs =
                voteRepository.countByOeuvreOeuvreIdAndValue(
                        oeuvre.getOeuvreId(), (byte) 1);

        long negatifs =
                voteRepository.countByOeuvreOeuvreIdAndValue(
                        oeuvre.getOeuvreId(), (byte) -1);

        oeuvre.setScore((int) (positifs - negatifs));
    }
}
