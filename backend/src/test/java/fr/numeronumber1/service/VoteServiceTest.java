
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
        user = new User();
        user.setUserId(10);

        author = new User();
        author.setUserId(20);

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
        when(oeuvreRepository.findById(1L))
                .thenReturn(Optional.of(oeuvre));
    }

    private void mockScore(long positive, long negative) {
        when(voteRepository.countByOeuvreOeuvreIdAndValue(
                1L, (byte) 1)).thenReturn(positive);

        when(voteRepository.countByOeuvreOeuvreIdAndValue(
                1L, (byte) -1)).thenReturn(negative);
    }

    private Vote createVote(byte value) {
        Vote vote = new Vote();
        vote.setOeuvre(oeuvre);
        vote.setUser(user);
        vote.setValue(value);
        return vote;
    }


    @Test
    void shouldThrowExceptionWhenWorkDoesNotExist() {
        when(oeuvreRepository.findById(999L))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> voteService.vote(999L, request(1), user)
        );

        assertEquals("Œuvre introuvable.", exception.getMessage());

        verify(oeuvreRepository).findById(999L);
        verify(voteRepository, never()).save(any(Vote.class));
        verify(voteRepository, never()).delete(any(Vote.class));
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldThrowExceptionWhenVotingForOwnWork() {
        oeuvre.setAuthor(user);

        mockExistingWork();

        UnauthorizedActionException exception = assertThrows(
                UnauthorizedActionException.class,
                () -> voteService.vote(1L, request(1), user)
        );

        assertEquals(
                "Vous ne pouvez pas voter pour votre propre œuvre.",
                exception.getMessage()
        );

        verify(voteRepository, never())
                .findByOeuvreOeuvreIdAndUserUserId(anyLong(), anyInt());

        verify(voteRepository, never()).save(any(Vote.class));
        verify(voteRepository, never()).delete(any(Vote.class));
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldThrowExceptionWhenVoteValueIsInvalid() {
        mockExistingWork();

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> voteService.vote(1L, request(0), user)
        );

        assertEquals(
                "La valeur du vote est invalide.",
                exception.getMessage()
        );

        verify(voteRepository, never())
                .findByOeuvreOeuvreIdAndUserUserId(anyLong(), anyInt());

        verify(voteRepository, never()).save(any(Vote.class));
        verify(voteRepository, never()).delete(any(Vote.class));
        verify(oeuvreRepository, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldCalculateScoreWhenPositiveVotesDominate() {
        mockScore(8, 3);

        long positive = voteRepository.countByOeuvreOeuvreIdAndValue(
                1L, (byte) 1);

        long negative = voteRepository.countByOeuvreOeuvreIdAndValue(
                1L, (byte) -1);

        assertEquals(5, positive - negative);
    }

    @Test
    void shouldCalculateNegativeScoreWhenNegativeVotesDominate() {
        mockScore(2, 5);

        long positive = voteRepository.countByOeuvreOeuvreIdAndValue(
                1L, (byte) 1);

        long negative = voteRepository.countByOeuvreOeuvreIdAndValue(
                1L, (byte) -1);

        assertEquals(-3, positive - negative);
    }

    @Test
    void shouldReturnMyVotes() {
        Vote vote = createVote((byte) 1);

        when(voteRepository.findByUserUserId(10))
                .thenReturn(List.of(vote));

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
        when(voteRepository.findByUserUserId(10))
                .thenReturn(List.of());

        List<UserVoteResponse> result = voteService.getMyVotes(user);

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(voteRepository).findByUserUserId(10);
    }
}
