package fr.numeronumber1.service;

import fr.numeronumber1.dto.request.VoteRequest;
import fr.numeronumber1.dto.response.OeuvreVoteResponse;
import fr.numeronumber1.dto.response.VoteResponse;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.exception.UnauthorizedActionException;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.Vote;
import fr.numeronumber1.model.VoteHistory;
import fr.numeronumber1.repository.OeuvreRepository;
import fr.numeronumber1.repository.VoteRepository;
import fr.numeronumber1.repository.VoteHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoteServiceTest {

    @Mock
    private VoteRepository voteRepository;

    @Mock
    private VoteHistoryRepository voteHistoryRepository;

    @Mock
    private OeuvreRepository oeuvreRepository;

    @InjectMocks
    private VoteService voteService;

    private User user;
    private User author;
    private Oeuvre oeuvre;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(10);
        user.setUsername("voter");

        author = new User();
        author.setUserId(20);
        author.setUsername("author");

        oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(1L);
        oeuvre.setTitle("Mon œuvre");
        oeuvre.setAuthor(author);
        oeuvre.setScore(0);
    }

    private VoteRequest request(Integer value) {
        return new VoteRequest(value);
    }

    private void mockExistingWork() {
        when(oeuvreRepository.findById(1L)).thenReturn(Optional.of(oeuvre));
    }

    private void mockScore(long positive, long negative) {
        when(voteRepository.countByOeuvreOeuvreIdAndValue(1L, (byte) 1))
                .thenReturn(positive);
        when(voteRepository.countByOeuvreOeuvreIdAndValue(1L, (byte) -1))
                .thenReturn(negative);
    }

    private Vote createVote(byte value) {
        Vote vote = new Vote();
        vote.setVoteId(100);
        vote.setOeuvre(oeuvre);
        vote.setUser(user);
        vote.setValue(value);
        vote.setCreatedAt(LocalDateTime.now());
        return vote;
    }

    @Test
    void shouldCreatePositiveVoteAndRecalculateScore() {
        mockExistingWork();
        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());
        when(voteRepository.save(any(Vote.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        mockScore(1, 0);

        VoteResponse response = voteService.vote(1L, request(1), user);

        assertEquals((byte) 1, response.value());
        assertEquals(10, response.userId());
        assertEquals(1, oeuvre.getScore());
        verify(voteRepository).save(argThat(vote ->
                vote.getOeuvre() == oeuvre
                        && vote.getUser() == user
                        && vote.getValue() == 1));
        verify(voteHistoryRepository).save(argThat(event ->
                event.getOeuvre() == oeuvre
                        && event.getUserId().equals(user.getUserId())
                        && event.getValue().equals(1)));
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldCreateNegativeVoteAndCalculateNegativeScore() {
        mockExistingWork();
        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());
        when(voteRepository.save(any(Vote.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        mockScore(0, 1);

        VoteResponse response = voteService.vote(1L, request(-1), user);

        assertEquals((byte) -1, response.value());
        assertEquals(-1, oeuvre.getScore());
        verify(voteRepository).save(any(Vote.class));
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldChangeExistingVoteAndRecalculateScore() {
        Vote existingVote = createVote((byte) 1);
        LocalDateTime originalCreatedAt = LocalDateTime.now().minusDays(1);
        existingVote.setCreatedAt(originalCreatedAt);
        mockExistingWork();
        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.of(existingVote));
        when(voteRepository.save(existingVote)).thenReturn(existingVote);
        mockScore(0, 1);

        VoteResponse response = voteService.vote(1L, request(-1), user);

        assertEquals((byte) -1, response.value());
        assertEquals((byte) -1, existingVote.getValue());
        assertTrue(existingVote.getCreatedAt().isAfter(originalCreatedAt));
        assertEquals(-1, oeuvre.getScore());
        verify(voteRepository).save(existingVote);
        verify(voteHistoryRepository).save(argThat(event ->
                event.getVoteId().equals(existingVote.getVoteId())
                        && event.getValue().equals(-1)));
        verify(voteRepository, never()).delete(any(Vote.class));
    }

    @Test
    void shouldKeepAnUnchangedVoteWithoutCreatingAnother() {
        Vote existingVote = createVote((byte) 1);
        LocalDateTime originalCreatedAt = existingVote.getCreatedAt();
        mockExistingWork();
        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.of(existingVote));
        mockScore(1, 0);

        VoteResponse response = voteService.vote(1L, request(1), user);

        assertEquals((byte) 1, response.value());
        assertEquals(originalCreatedAt, existingVote.getCreatedAt());
        assertEquals(1, oeuvre.getScore());
        verify(voteRepository, never()).save(any(Vote.class));
        verify(voteRepository, never()).delete(any(Vote.class));
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldRemoveExistingVoteAndRecalculateScore() {
        Vote existingVote = createVote((byte) 1);
        mockExistingWork();
        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.of(existingVote));
        mockScore(0, 0);

        VoteResponse response = voteService.vote(1L, request(null), user);

        assertNull(response.value());
        assertEquals(10, response.userId());
        assertEquals(0, oeuvre.getScore());
        verify(voteRepository).delete(existingVote);
        verify(voteRepository, never()).save(any(Vote.class));
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldAllowRemovingVoteWhenNoVoteExistsWithoutCreatingOne() {
        mockExistingWork();
        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());
        mockScore(2, 1);

        VoteResponse response = voteService.vote(1L, request(null), user);

        assertNull(response.value());
        assertEquals(10, response.userId());
        assertEquals(1, oeuvre.getScore());
        verify(voteRepository, never()).save(any(Vote.class));
        verify(voteRepository, never()).delete(any(Vote.class));
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldThrowWhenWorkDoesNotExist() {
        when(oeuvreRepository.findById(999L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> voteService.vote(999L, request(1), user));

        assertEquals("Œuvre introuvable.", exception.getMessage());
        verifyNoInteractions(voteRepository);
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldThrowWhenVotingForOwnWork() {
        oeuvre.setAuthor(user);
        mockExistingWork();

        UnauthorizedActionException exception = assertThrows(
                UnauthorizedActionException.class,
                () -> voteService.vote(1L, request(1), user));

        assertEquals(
                "Vous ne pouvez pas voter pour votre propre œuvre.",
                exception.getMessage());
        verifyNoInteractions(voteRepository);
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldRejectInvalidVoteValue() {
        mockExistingWork();

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> voteService.vote(1L, request(0), user));

        assertEquals("La valeur du vote est invalide.", exception.getMessage());
        verifyNoInteractions(voteRepository);
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldReturnCurrentUsersVote() {
        Vote vote = createVote((byte) -1);
        mockExistingWork();
        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.of(vote));

        VoteResponse response = voteService.getMyVote(1L, user);

        assertNotNull(response);
        assertEquals(100, response.id());
        assertEquals((byte) -1, response.value());
        assertEquals(1L, response.oeuvre().getId());
    }

    @Test
    void shouldReturnNullWhenCurrentUserHasNotVoted() {
        mockExistingWork();
        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());

        assertNull(voteService.getMyVote(1L, user));
    }

    @Test
    void shouldThrowWhenReadingVoteForMissingWork() {
        when(oeuvreRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> voteService.getMyVote(999L, user));
        verifyNoInteractions(voteRepository);
    }

    @Test
    void shouldReturnAllVotesForWorkAsVoteSummary() {
        Vote firstVote = createVote((byte) 1);
        Vote secondVote = createVote((byte) -1);
        secondVote.setVoteId(101);
        secondVote.setUser(author);
        mockExistingWork();
        when(voteRepository.findByOeuvreOeuvreId(1L))
                .thenReturn(List.of(firstVote, secondVote));

        OeuvreVoteResponse response = voteService.getOeuvreVotes(1L);

        assertEquals(1L, response.oeuvre().getId());
        assertEquals(2, response.votes().size());
        assertEquals((byte) 1, response.votes().get(0).value());
        assertEquals((byte) -1, response.votes().get(1).value());
    }

    @Test
    void shouldThrowWhenGettingVoteSummaryForMissingWork() {
        when(oeuvreRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> voteService.getOeuvreVotes(999L));
        verify(voteRepository, never()).findByOeuvreOeuvreId(anyLong());
    }

    @Test
    void shouldReturnVotesByWorkWhenWorkExists() {
        Vote vote = createVote((byte) 1);
        when(oeuvreRepository.existsById(1L)).thenReturn(true);
        when(voteRepository.findByOeuvreOeuvreId(1L)).thenReturn(List.of(vote));

        assertEquals(List.of(vote), voteService.getVotesByWork(1L));
    }

    @Test
    void shouldThrowWhenGettingVotesForMissingWork() {
        when(oeuvreRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> voteService.getVotesByWork(999L));
        verify(voteRepository, never()).findByOeuvreOeuvreId(anyLong());
    }

    @Test
    void shouldCreatePositiveVoteAndUpdateScore() {
        mockExistingWork();

        when(voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());

        mockScore(1, 0);

        when(voteRepository.save(any(Vote.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        voteService.vote(1L, request(1), user);

        assertEquals(1, oeuvre.getScore());
        verify(voteRepository).save(any(Vote.class));
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldCreateNegativeVoteAndUpdateScore() {
        mockExistingWork();

        when(voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());

        mockScore(0, 1);

        when(voteRepository.save(any(Vote.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        voteService.vote(1L, request(-1), user);

        assertEquals(-1, oeuvre.getScore());
        verify(voteRepository).save(any(Vote.class));
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldCalculatePositiveScoreThroughService() {
        mockExistingWork();

        when(voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());

        mockScore(8, 3);

        when(voteRepository.save(any(Vote.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        voteService.vote(1L, request(1), user);

        assertEquals(5, oeuvre.getScore());
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldCalculateNegativeScoreThroughService() {
        mockExistingWork();

        when(voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());

        mockScore(2, 5);

        when(voteRepository.save(any(Vote.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        voteService.vote(1L, request(-1), user);

        assertEquals(-3, oeuvre.getScore());
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldSetScoreToZeroWhenThereAreNoVotes() {
        mockExistingWork();

        when(voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());

        mockScore(0, 0);

        voteService.vote(1L, request(null), user);

        assertEquals(0, oeuvre.getScore());
        verify(voteRepository, never()).save(any(Vote.class));
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldUpdateVoteAndRecalculateScore() {
        mockExistingWork();

        Vote existingVote = createVote((byte) 1);

        when(voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.of(existingVote));

        mockScore(0, 1);

        when(voteRepository.save(any(Vote.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        voteService.vote(1L, request(-1), user);

        assertEquals((byte) -1, existingVote.getValue());
        assertEquals(-1, oeuvre.getScore());
        assertNotNull(existingVote.getCreatedAt());

        verify(voteRepository).save(existingVote);
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldDeleteVoteAndRecalculateScore() {
        mockExistingWork();

        Vote existingVote = createVote((byte) 1);

        when(voteRepository
                .findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.of(existingVote));

        mockScore(0, 0);

        voteService.vote(1L, request(null), user);

        assertEquals(0, oeuvre.getScore());

        verify(voteRepository).delete(existingVote);
        verify(voteHistoryRepository).save(argThat(event ->
                event.getVoteId().equals(existingVote.getVoteId())
                        && event.getValue() == null));
        verify(oeuvreRepository).save(oeuvre);
    }

}
