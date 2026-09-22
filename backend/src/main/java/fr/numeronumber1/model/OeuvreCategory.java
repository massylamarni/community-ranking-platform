package fr.numeronumber1.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "oeuvre_categories")
public class OeuvreCategory {
    @EmbeddedId
    private OeuvreCategoryId id;

    @ManyToOne(optional = false)
    @MapsId("oeuvreId")
    @JoinColumn(name = "oeuvre_id", nullable = false)
    private Oeuvre oeuvre;

    @ManyToOne(optional = false)
    @MapsId("categoryId")
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    public OeuvreCategoryId getId() {
        return id;
    }

    public void setId(OeuvreCategoryId id) {
        this.id = id;
    }

    public Oeuvre getOeuvre() {
        return oeuvre;
    }

    public void setOeuvre(Oeuvre oeuvre) {
        this.oeuvre = oeuvre;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    
}
