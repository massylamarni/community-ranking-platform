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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
    private OeuvreRepository oeuvreRepository;

    @InjectMocks
    private VoteService voteService;

    private User user;
    private User author;
    private Oeuvre oeuvre;

    @BeforeEach
    void setUp() {
        user = mock(User.class);
        author = mock(User.class);
        oeuvre = mock(Oeuvre.class);
    }

    private VoteRequest createRequest(String type) {
        VoteRequest request = new VoteRequest();
        request.setType(type);
        return request;
    }

    private void mockScore(Long oeuvreId, long positive, long negative) {
        when(voteRepository.countByOeuvreOeuvreIdAndValue(
                oeuvreId, (byte) 1)).thenReturn(positive);

        when(voteRepository.countByOeuvreOeuvreIdAndValue(
                oeuvreId, (byte) -1)).thenReturn(negative);
    }

    @Test
    void shouldCreatePositiveVoteAndUpdateScore() {
        when(user.getUserId()).thenReturn(10);
        when(author.getUserId()).thenReturn(20);
        when(oeuvre.getOeuvreId()).thenReturn(1L);
        when(oeuvre.getAuthor()).thenReturn(author);

        when(oeuvreRepository.findById(1L))
                .thenReturn(Optional.of(oeuvre));

        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());

        when(voteRepository.save(any(Vote.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        mockScore(1L, 1, 0);

        Vote result = voteService.createVote(
                1L, createRequest("positive"), user);

        assertNotNull(result);
        assertEquals((byte) 1, result.getValue());
        assertEquals(oeuvre, result.getOeuvre());
        assertEquals(user, result.getUser());

        verify(voteRepository).save(any(Vote.class));
        verify(oeuvre).setScore(1);
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldCreateNegativeVoteAndUpdateScore() {
        when(user.getUserId()).thenReturn(10);
        when(author.getUserId()).thenReturn(20);
        when(oeuvre.getOeuvreId()).thenReturn(1L);
        when(oeuvre.getAuthor()).thenReturn(author);

        when(oeuvreRepository.findById(1L))
                .thenReturn(Optional.of(oeuvre));

        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());

        when(voteRepository.save(any(Vote.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        mockScore(1L, 0, 1);

        Vote result = voteService.createVote(
                1L, createRequest("negative"), user);

        assertNotNull(result);
        assertEquals((byte) -1, result.getValue());

        verify(voteRepository).save(any(Vote.class));
        verify(oeuvre).setScore(-1);
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldThrowExceptionWhenCreatingVoteForNonExistingWork() {
        when(oeuvreRepository.findById(999L))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> voteService.createVote(
                        999L, createRequest("positive"), user)
        );

        assertEquals("Œuvre introuvable", exception.getMessage());

        verify(oeuvreRepository).findById(999L);
        verify(voteRepository, never()).save(any(Vote.class));
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldThrowExceptionWhenVotingForOwnWork() {
        when(user.getUserId()).thenReturn(10);
        when(author.getUserId()).thenReturn(10);
        when(oeuvre.getAuthor()).thenReturn(author);

        when(oeuvreRepository.findById(1L))
                .thenReturn(Optional.of(oeuvre));

        UnauthorizedActionException exception = assertThrows(
                UnauthorizedActionException.class,
                () -> voteService.createVote(
                        1L, createRequest("positive"), user)
        );

        assertEquals(
                "Vous ne pouvez pas voter pour votre propre œuvre",
                exception.getMessage()
        );

        verify(voteRepository, never()).save(any(Vote.class));
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldThrowExceptionWhenVotingTwiceForSameWork() {
        when(user.getUserId()).thenReturn(10);

        when(oeuvreRepository.findById(1L))
                .thenReturn(Optional.of(oeuvre));

        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.of(mock(Vote.class)));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> voteService.createVote(
                        1L, createRequest("positive"), user)
        );

        assertEquals(
                "Vous avez déjà voté pour cette œuvre",
                exception.getMessage()
        );

        verify(voteRepository, never()).save(any(Vote.class));
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldThrowExceptionWhenCreatingVoteWithInvalidType() {
        when(user.getUserId()).thenReturn(10);
        when(author.getUserId()).thenReturn(20);

        when(oeuvre.getAuthor()).thenReturn(author);

        when(oeuvreRepository.findById(1L))
                .thenReturn(Optional.of(oeuvre));

        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> voteService.createVote(
                        1L, createRequest("neutral"), user)
        );

        assertEquals(
                "Le type de vote doit être 'positive' ou 'negative'",
                exception.getMessage()
        );

        verify(voteRepository, never()).save(any(Vote.class));
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldUpdateVoteAndRecalculateScore() {
        when(user.getUserId()).thenReturn(10);

        Vote vote = mock(Vote.class);

        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.of(vote));

        when(vote.getOeuvre()).thenReturn(oeuvre);
        when(oeuvre.getOeuvreId()).thenReturn(1L);
        when(voteRepository.save(vote)).thenReturn(vote);

        mockScore(1L, 0, 1);

        Vote result = voteService.updateVote(
                1L, createRequest("negative"), user);

        assertNotNull(result);

        verify(vote).setValue((byte) -1);
        verify(voteRepository).save(vote);
        verify(oeuvre).setScore(-1);
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingVote() {
        when(user.getUserId()).thenReturn(10);

        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> voteService.updateVote(
                        1L, createRequest("positive"), user)
        );

        assertEquals(
                "Vous n'avez pas encore voté pour cette œuvre",
                exception.getMessage()
        );

        verify(voteRepository, never()).save(any(Vote.class));
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingVoteWithInvalidType() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> voteService.updateVote(
                        1L, createRequest("neutral"), user)
        );

        assertEquals(
                "Le type de vote doit être 'positive' ou 'negative'",
                exception.getMessage()
        );

        verify(voteRepository, never()).save(any(Vote.class));
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldDeleteVoteAndRecalculateScore() {
        when(user.getUserId()).thenReturn(10);

        Vote vote = mock(Vote.class);

        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.of(vote));

        when(vote.getOeuvre()).thenReturn(oeuvre);
        when(oeuvre.getOeuvreId()).thenReturn(1L);

        mockScore(1L, 2, 1);

        voteService.deleteVote(1L, user);

        verify(voteRepository).delete(vote);
        verify(oeuvre).setScore(1);
        verify(oeuvreRepository).save(oeuvre);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistingVote() {
        when(user.getUserId()).thenReturn(10);

        when(voteRepository.findByOeuvreOeuvreIdAndUserUserId(1L, 10))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> voteService.deleteVote(1L, user)
        );

        assertEquals(
                "Vous n'avez pas encore voté pour cette œuvre",
                exception.getMessage()
        );

        verify(voteRepository, never()).delete(any(Vote.class));
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldReturnPositiveMinusNegativeVotes() {
        mockScore(1L, 8, 3);

        int score = voteService.getScore(1L);

        assertEquals(5, score);

        verify(voteRepository)
                .countByOeuvreOeuvreIdAndValue(1L, (byte) 1);

        verify(voteRepository)
                .countByOeuvreOeuvreIdAndValue(1L, (byte) -1);
    }

    @Test
    void shouldReturnNegativeScoreWhenNegativeVotesDominate() {
        mockScore(1L, 2, 5);

        int score = voteService.getScore(1L);

        assertEquals(-3, score);
    }

    @Test
    void shouldReturnZeroWhenThereAreNoVotes() {
        mockScore(1L, 0, 0);

        int score = voteService.getScore(1L);

        assertEquals(0, score);
    }

    @Test
    void shouldReturnUserVotes() {
        when(user.getUserId()).thenReturn(10);

        Vote vote = mock(Vote.class);
        Oeuvre votedWork = mock(Oeuvre.class);

        when(voteRepository.findByUserUserId(10))
                .thenReturn(List.of(vote));

        when(vote.getOeuvre()).thenReturn(votedWork);
        when(votedWork.getOeuvreId()).thenReturn(1L);
        when(votedWork.getTitle()).thenReturn("Mon œuvre");
        when(vote.getValue()).thenReturn((byte) 1);

        List<UserVoteResponse> result = voteService.getMyVotes(user);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getWorkId());
        assertEquals("Mon œuvre", result.get(0).getWorkTitle());
        assertEquals("positive", result.get(0).getVote());

        verify(voteRepository).findByUserUserId(10);
    }

    @Test
    void shouldReturnEmptyListWhenUserHasNoVotes() {
        when(user.getUserId()).thenReturn(10);

        when(voteRepository.findByUserUserId(10))
                .thenReturn(List.of());

        List<UserVoteResponse> result = voteService.getMyVotes(user);

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(voteRepository).findByUserUserId(10);
    }
}