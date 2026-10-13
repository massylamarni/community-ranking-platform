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


    @Transactional(readOnly = true)
    public List<UserVoteResponse> getMyVotes(User user) {

        return voteRepository.findByUserUserId(user.getUserId())
                .stream()
                .map(UserVoteResponse::new)
                .toList();
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
            throw new IllegalArgumentException(
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

    @Transactional(readOnly = true)
    public List<Vote> getVotesByWork(Long workId) {
        if (!oeuvreRepository.existsById(workId)) {
            throw new ResourceNotFoundException("Œuvre introuvable.");
        }

        return voteRepository.findByOeuvreOeuvreId(workId);
    }
}
