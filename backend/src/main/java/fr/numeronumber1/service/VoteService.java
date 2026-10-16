package fr.numeronumber1.service;
import fr.numeronumber1.dto.request.VoteRequest;
import fr.numeronumber1.dto.response.*;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.exception.UnauthorizedActionException;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.model.VoteHistory;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.VoteRepository;
import fr.numeronumber1.repository.VoteHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final VoteHistoryRepository voteHistoryRepository;
    private final OeuvreRepository oeuvreRepository;

    public VoteService(
            VoteRepository voteRepository,
            VoteHistoryRepository voteHistoryRepository,
            OeuvreRepository oeuvreRepository) {
        this.voteRepository = voteRepository;
        this.voteHistoryRepository = voteHistoryRepository;
        this.oeuvreRepository = oeuvreRepository;
    }


    @Transactional(readOnly = true)
    public VoteResponse getMyVote(Long workId, User user) {
        Oeuvre oeuvre = oeuvreRepository.findById(workId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Œuvre introuvable."));

        OeuvreResponse oeuvreResponse = new OeuvreResponse(oeuvre);

        return voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(workId, user.getUserId())
                .map(vote -> new VoteResponse(vote, oeuvreResponse))
                .orElse(null);
    }

    @Transactional
    public VoteResponse vote(Long workId, VoteRequest request, User user) {
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

        Vote vote;

        if (value == null) {
            if (existingVote.isPresent()) {
                vote = existingVote.get();
                recordVoteEvent(vote, null, LocalDateTime.now());
                voteRepository.delete(vote);
            } else {
                vote = new Vote();
                vote.setOeuvre(oeuvre);
                vote.setUser(user);
                vote.setCreatedAt(LocalDateTime.now());
            }
        } else if (existingVote.isPresent()) {
            vote = existingVote.get();
            if (vote.getValue() != value.byteValue()) {
                vote.setValue(value.byteValue());
                LocalDateTime changedAt = LocalDateTime.now();
                vote.setCreatedAt(changedAt);
                vote = voteRepository.save(vote);
                recordVoteEvent(vote, value, changedAt);
            }
        } else {
            vote = new Vote();
            vote.setOeuvre(oeuvre);
            vote.setUser(user);
            vote.setValue(value.byteValue());
            LocalDateTime createdAt = LocalDateTime.now();
            vote.setCreatedAt(createdAt);

            vote = voteRepository.save(vote);
            recordVoteEvent(vote, value, createdAt);
        }

        recalculerScore(oeuvre);
        oeuvreRepository.save(oeuvre);

        OeuvreResponse oeuvreResponse = new OeuvreResponse(oeuvre);

        if (value == null) {
            return new VoteResponse(
                    vote.getVoteId(),
                    vote.getUser().getUserId(),
                    null,
                    vote.getCreatedAt(),
                    oeuvreResponse
            );
        }

        return new VoteResponse(vote, oeuvreResponse);
    }

    private void recordVoteEvent(Vote vote, Integer value, LocalDateTime eventAt) {
        VoteHistory event = new VoteHistory();
        event.setVoteId(vote.getVoteId());
        event.setOeuvre(vote.getOeuvre());
        event.setUserId(vote.getUser().getUserId());
        event.setValue(value);
        event.setEventAt(eventAt);
        voteHistoryRepository.save(event);
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

    @Transactional(readOnly = true)
    public OeuvreVoteResponse getOeuvreVotes(Long workId) {
        Oeuvre oeuvre = oeuvreRepository.findById(workId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Œuvre introuvable."));

        OeuvreResponse oeuvreResponse = new OeuvreResponse(oeuvre);

        List<VoteItemResponse> votes = voteRepository
                .findByOeuvreOeuvreId(workId)
                .stream()
                .map(vote -> new VoteItemResponse(vote))
                .toList();

        return new OeuvreVoteResponse(oeuvreResponse, votes);
    }
}
