package fr.numeronumber1.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fr.numeronumber1.dto.request.CreateOeuvreRequest;
import fr.numeronumber1.dto.request.SubmitOeuvreRequest;
import fr.numeronumber1.dto.request.UpdateOeuvreRequest;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.exception.UnauthorizedActionException;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.OeuvreCategory;
import fr.numeronumber1.model.OeuvreCategoryId;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.CategoryRepository;
import fr.numeronumber1.repository.OeuvreCategoryRepository;
import fr.numeronumber1.repository.OeuvreRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import org.springframework.web.multipart.MultipartFile;

@Service
public class OeuvreService {

    private final OeuvreRepository oeuvres;
    private final CategoryRepository categories;
    private final OeuvreCategoryRepository oeuvreCategories;
    private final FileStorageService fileStorageService;

    public OeuvreService(OeuvreRepository oeuvres, CategoryRepository categories,
                         OeuvreCategoryRepository oeuvreCategories,
                         FileStorageService fileStorageService) {
        this.oeuvres = oeuvres;
        this.categories = categories;
        this.oeuvreCategories = oeuvreCategories;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public Oeuvre getById(Long id) {
        return oeuvres.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Œuvre introuvable"));
    }

    @Transactional(readOnly = true)
    public List<Oeuvre> getAll(OeuvreStatus status, Integer categoryId, String title) {
        Specification<Oeuvre> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (categoryId != null) {
                Join<Oeuvre, OeuvreCategory> oc = root.join("oeuvreCategories", JoinType.LEFT);
                predicates.add(cb.equal(oc.get("category").get("categoryId"), categoryId));
                query.distinct(true);
            }
            if (title != null && !title.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return oeuvres.findAll(spec);
    }

    @Transactional
    public Oeuvre create(CreateOeuvreRequest req, User author) {
        if (oeuvres.existsByTitle(req.getTitle()))
            throw new IllegalArgumentException("Une œuvre avec ce titre existe déjà");

        Oeuvre o = new Oeuvre();
        o.setTitle(req.getTitle());
        o.setDescription(req.getDescription());

        if (req.getImage() != null && !req.getImage().isEmpty()) {
            o.setImageUrl(fileStorageService.store(req.getImage(), "works"));
        } else if (req.getImageUrl() != null && !req.getImageUrl().isBlank()) {
            o.setImageUrl(req.getImageUrl());
        }

        o.setAuthor(author);
        if (author.isAdmin()) {
            o.setStatus(OeuvreStatus.approved);
        }
        return oeuvres.save(o);
    }

    @Transactional
    public Oeuvre update(Long id, UpdateOeuvreRequest req, User requester) {
        Oeuvre o = oeuvres.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Œuvre introuvable"));

        if (!o.getAuthor().getUserId().equals(requester.getUserId())) {
            throw new UnauthorizedActionException("Vous n'êtes pas l'auteur de cette œuvre");
        }

        OeuvreStatus st = o.getStatus();
        if (st != OeuvreStatus.created && st != OeuvreStatus.rejected) {
            throw new IllegalArgumentException("Cette œuvre ne peut pas être modifiée dans son état actuel");
        }

        if (req.getTitle() != null && !req.getTitle().isBlank()) {
            if (oeuvres.existsByTitleAndOeuvreIdNot(req.getTitle(), id)) {
                throw new IllegalArgumentException("Une œuvre avec ce titre existe déjà");
            }
            o.setTitle(req.getTitle());
        }

        if (req.getDescription() != null) {
            o.setDescription(req.getDescription());
        }

        // une proposition refusée redevient "created" apres modification
        if (st == OeuvreStatus.rejected) {
            o.setStatus(OeuvreStatus.created);
        }

        return oeuvres.save(o);
    }

    @Transactional
    public Oeuvre uploadImage(Long id, MultipartFile image, User requester) {
        Oeuvre o = oeuvres.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Œuvre introuvable"));

        if (!o.getAuthor().getUserId().equals(requester.getUserId()))
            throw new IllegalArgumentException("Vous n'êtes pas l'auteur de cette œuvre");

        String imageUrl = fileStorageService.store(image, "works");
        o.setImageUrl(imageUrl);
        return oeuvres.save(o);
    }

    @Transactional
    public Oeuvre submit(Long id, SubmitOeuvreRequest req, User requester) {
        Oeuvre o = oeuvres.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Œuvre introuvable"));

        if (!o.getAuthor().getUserId().equals(requester.getUserId()))
            throw new IllegalArgumentException("Vous n'êtes pas l'auteur de cette œuvre");

        if (o.getStatus() != OeuvreStatus.created && o.getStatus() != OeuvreStatus.rejected)
            throw new IllegalArgumentException("Cette œuvre a déjà été soumise");

        if (o.getStatus() == OeuvreStatus.rejected) {
            o.setStatus(OeuvreStatus.pending);
            return oeuvres.save(o);
        }

        List<Category> chosen = categories.findAllById(req.getCategoryIds());
        if (chosen.size() != req.getCategoryIds().size())
            throw new ResourceNotFoundException("Une ou plusieurs catégories sont introuvables");

        for (Category c : chosen) {
            OeuvreCategoryId compositeId = new OeuvreCategoryId(o.getOeuvreId(), c.getCategoryId());
            OeuvreCategory link = new OeuvreCategory();
            link.setId(compositeId);
            link.setOeuvre(o);
            link.setCategory(c);
            oeuvreCategories.save(link);
        }

        o.setStatus(OeuvreStatus.pending);
        return oeuvres.save(o);
    }

    @Transactional
    public void delete(Long id, User requester) {
        Oeuvre o = oeuvres.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Œuvre introuvable"));

        if (!o.getAuthor().getUserId().equals(requester.getUserId()) && !requester.isAdmin()) {
            throw new UnauthorizedActionException("Vous n'êtes pas autorisé à supprimer cette œuvre");
        }

        oeuvres.delete(o);
    }
}

