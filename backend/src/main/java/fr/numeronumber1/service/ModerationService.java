package fr.numeronumber1.service;

import fr.numeronumber1.dto.request.RefuseWork;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.enums.NotificationType;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.OeuvreRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ModerationService {

        private final OeuvreRepository oeuvres;
        private final NotificationService notificationService;

        public ModerationService(OeuvreRepository oeuvres, NotificationService notificationService) {
            this.oeuvres = oeuvres;
            this.notificationService = notificationService;
        }

        public Page<Oeuvre> getPendingWorks(Pageable pageable) {
            return oeuvres.findByStatus(OeuvreStatus.pending, pageable);
        }

    @Transactional
    public Oeuvre accept(Long id) {
        Oeuvre oeuvre = oeuvres.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Œuvre introuvable"));

        if (oeuvre.getStatus() != OeuvreStatus.pending) {
            throw new IllegalArgumentException(
                    "Seules les œuvres en attente peuvent être acceptées"
            );
        }

        oeuvre.setStatus(OeuvreStatus.approved);

        Oeuvre saved = oeuvres.save(oeuvre);

        String author = saved.getAuthor().getUsername();
        String message = "Votre œuvre \"" + saved.getTitle() + "\" a été acceptée.";
        notificationService.create(author, NotificationType.MODERATION, message);

        return saved;
    }

    @Transactional
    public Oeuvre refuse(Long id, RefuseWork request) {
        Oeuvre oeuvre = oeuvres.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Œuvre introuvable"));

        if (oeuvre.getStatus() != OeuvreStatus.pending) {
            throw new IllegalArgumentException(
                    "Seules les œuvres en attente peuvent être refusées"
            );
        }

        oeuvre.setStatus(OeuvreStatus.rejected);

        Oeuvre saved = oeuvres.save(oeuvre);
        String author = saved.getAuthor().getUsername();
        String message = "Votre œuvre \"" + saved.getTitle() + "\" a été refusée. Motif : "
                + saved.getRejectionReason();
        notificationService.create(author, NotificationType.MODERATION, message);

        return saved;
    }
}
