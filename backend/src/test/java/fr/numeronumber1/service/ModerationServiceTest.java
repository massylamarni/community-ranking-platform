package fr.numeronumber1.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import fr.numeronumber1.dto.request.RefuseWork;
import fr.numeronumber1.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.OeuvreRepository;

@ExtendWith(MockitoExtension.class)
class ModerationServiceTest {

    @Mock
    private OeuvreRepository oeuvres;

    @InjectMocks
    private ModerationService moderationService;

    @Test
    void shouldReturnPendingWorks() {
        Pageable pageable = PageRequest.of(0, 10);

        Oeuvre oeuvre1 = new Oeuvre();
        oeuvre1.setOeuvreId(1L);
        oeuvre1.setTitle("Œuvre 1");
        oeuvre1.setStatus(OeuvreStatus.pending);

        Oeuvre oeuvre2 = new Oeuvre();
        oeuvre2.setOeuvreId(2L);
        oeuvre2.setTitle("Œuvre 2");
        oeuvre2.setStatus(OeuvreStatus.pending);

        Page<Oeuvre> expectedPage = new PageImpl<>(
                List.of(oeuvre1, oeuvre2),
                pageable,
                2
        );

        when(oeuvres.findByStatus(OeuvreStatus.pending, pageable))
                .thenReturn(expectedPage);

        Page<Oeuvre> result =
                moderationService.getPendingWorks(pageable);

        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertEquals("Œuvre 1", result.getContent().get(0).getTitle());
        assertEquals("Œuvre 2", result.getContent().get(1).getTitle());
        assertEquals(2, result.getTotalElements());
        assertEquals(0, result.getNumber());
        assertEquals(10, result.getSize());

        verify(oeuvres).findByStatus(
                OeuvreStatus.pending,
                pageable
        );
    }

    @Test
    void shouldReturnEmptyPageWhenNoPendingWorksExist() {
        Pageable pageable = PageRequest.of(0, 10);

        Page<Oeuvre> emptyPage = new PageImpl<>(
                List.of(),
                pageable,
                0
        );

        when(oeuvres.findByStatus(OeuvreStatus.pending, pageable))
                .thenReturn(emptyPage);

        Page<Oeuvre> result =
                moderationService.getPendingWorks(pageable);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        assertEquals(0, result.getTotalElements());

        verify(oeuvres).findByStatus(
                OeuvreStatus.pending,
                pageable
        );
    }

    @Test
    void shouldUseProvidedPagination() {
        Pageable pageable = PageRequest.of(1, 5);

        Page<Oeuvre> expectedPage = new PageImpl<>(
                List.of(),
                pageable,
                0
        );

        when(oeuvres.findByStatus(OeuvreStatus.pending, pageable))
                .thenReturn(expectedPage);

        Page<Oeuvre> result =
                moderationService.getPendingWorks(pageable);

        assertEquals(1, result.getNumber());
        assertEquals(5, result.getSize());

        verify(oeuvres).findByStatus(
                OeuvreStatus.pending,
                pageable
        );
    }

    @Test
    void shouldAcceptPendingWork() {
        Long workId = 1L;

        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(workId);
        oeuvre.setTitle("Œuvre 1");
        oeuvre.setStatus(OeuvreStatus.pending);

        when(oeuvres.findById(workId))
                .thenReturn(Optional.of(oeuvre));

        when(oeuvres.save(oeuvre))
                .thenReturn(oeuvre);

        Oeuvre result = moderationService.accept(workId);

        assertNotNull(result);
        assertEquals(OeuvreStatus.approved, result.getStatus());
        assertNull(result.getRejectionReason());

        verify(oeuvres).findById(workId);
        verify(oeuvres).save(oeuvre);
    }

    @Test
    void shouldRejectAcceptWhenWorkIsNotPending() {
        Long workId = 1L;

        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(workId);
        oeuvre.setStatus(OeuvreStatus.created);

        when(oeuvres.findById(workId))
                .thenReturn(Optional.of(oeuvre));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> moderationService.accept(workId)
        );

        assertEquals(
                "Seules les œuvres en attente peuvent être acceptées",
                exception.getMessage()
        );

        verify(oeuvres).findById(workId);
        verify(oeuvres, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldThrowExceptionWhenAcceptingUnknownWork() {
        Long workId = 999L;

        when(oeuvres.findById(workId))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> moderationService.accept(workId)
        );

        assertEquals("Œuvre introuvable", exception.getMessage());

        verify(oeuvres).findById(workId);
        verify(oeuvres, never()).save(any(Oeuvre.class));
    }

    @Test
    void shouldRefusePendingWork() {
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(1L);
        oeuvre.setStatus(OeuvreStatus.pending);

        RefuseWork request = new RefuseWork();
        request.setReason("La qualité de l'image est insuffisante.");

        when(oeuvres.findById(1L)).thenReturn(Optional.of(oeuvre));
        when(oeuvres.save(oeuvre)).thenReturn(oeuvre);

        Oeuvre result = moderationService.refuse(1L, request);

        assertEquals(OeuvreStatus.rejected, result.getStatus());
        assertEquals(OeuvreStatus.rejected, oeuvre.getStatus());
        assertEquals("La qualité de l'image est insuffisante.", result.getRejectionReason());

        verify(oeuvres).findById(1L);
        verify(oeuvres).save(oeuvre);
    }

    @Test
    void shouldThrowExceptionWhenWorkDoesNotExist() {
        RefuseWork request = new RefuseWork();
        request.setReason("La qualité de l'image est insuffisante.");

        when(oeuvres.findById(1L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> moderationService.refuse(1L, request)
        );

        assertEquals("Œuvre introuvable", exception.getMessage());

        verify(oeuvres).findById(1L);
        verify(oeuvres, never()).save(any());
    }

    @Test
    void shouldThrowExceptionWhenWorkIsNotPending() {
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(1L);
        oeuvre.setStatus(OeuvreStatus.approved);

        RefuseWork request = new RefuseWork();
        request.setReason("La qualité de l'image est insuffisante.");

        when(oeuvres.findById(1L)).thenReturn(Optional.of(oeuvre));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> moderationService.refuse(1L, request)
        );

        assertEquals(
                "Seules les œuvres en attente peuvent être refusées",
                exception.getMessage()
        );

        verify(oeuvres).findById(1L);
        verify(oeuvres, never()).save(any());
    }
}