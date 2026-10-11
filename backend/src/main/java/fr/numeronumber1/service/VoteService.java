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

    @Transactional
    public void deleteVote(Long oeuvreId, User user) {

        Vote vote = voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(
                        oeuvreId, user.getUserId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Vous n'avez pas encore voté pour cette œuvre"));
        Oeuvre oeuvre = vote.getOeuvre();
        voteRepository.delete(vote);
        recalculerScore(oeuvre);
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


    private void recalculerScore(Oeuvre oeuvre) {

        int score = getScore(oeuvre.getOeuvreId());

        oeuvre.setScore(score);

        oeuvreRepository.save(oeuvre);
    }


    private byte convertVoteType(String type) {

        if ("positive".equals(type)) {
            return 1;
        }

        if ("negative".equals(type)) {
            return -1;
        }

        throw new IllegalArgumentException(
                "Le type de vote doit être 'positive' ou 'negative'");
    }
}
