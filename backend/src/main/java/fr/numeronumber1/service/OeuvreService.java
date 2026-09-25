package fr.numeronumber1.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fr.numeronumber1.dto.request.CreateOeuvreRequest;
import fr.numeronumber1.dto.request.SubmitOeuvreRequest;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.OeuvreCategory;
import fr.numeronumber1.model.OeuvreCategoryId;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.CategoryRepository;
import fr.numeronumber1.repository.OeuvreCategoryRepository;
import fr.numeronumber1.repository.OeuvreRepository;

@Service
public class OeuvreService {

    private final OeuvreRepository oeuvres;
    private final CategoryRepository categories;
    private final OeuvreCategoryRepository oeuvreCategories;

    public OeuvreService(OeuvreRepository oeuvres, CategoryRepository categories,
                         OeuvreCategoryRepository oeuvreCategories) {
        this.oeuvres = oeuvres;
        this.categories = categories;
        this.oeuvreCategories = oeuvreCategories;
    }

    @Transactional
    public Oeuvre create(CreateOeuvreRequest req, User author) {
        if (oeuvres.existsByTitle(req.getTitle()))
            throw new IllegalArgumentException("Une œuvre avec ce titre existe déjà");

        Oeuvre o = new Oeuvre();
        o.setTitle(req.getTitle());
        o.setDescription(req.getDescription());
        o.setAuthor(author);
        // status defaults to 'created' in the entity
        return oeuvres.save(o);
    }

    @Transactional
    public Oeuvre submit(Long id, SubmitOeuvreRequest req, User requester) {
        Oeuvre o = oeuvres.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Œuvre introuvable"));

        if (!o.getAuthor().getUserId().equals(requester.getUserId()))
            throw new IllegalArgumentException("Vous n'êtes pas l'auteur de cette œuvre");

        if (o.getStatus() != OeuvreStatus.created)
            throw new IllegalArgumentException("Cette œuvre a déjà été soumise");

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
}
