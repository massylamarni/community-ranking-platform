package fr.numeronumber1.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class OeuvreCategoryId implements Serializable {
    @Column(name = "oeuvre_id")
    private Long oeuvreId;

    @Column(name = "category_id")
    private Integer categoryId;

    public OeuvreCategoryId() {
    }

    public OeuvreCategoryId(Long oeuvreId, Integer categoryId) {
        this.oeuvreId = oeuvreId;
        this.categoryId = categoryId;
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) {
            return true;
        }
        if (!(object instanceof OeuvreCategoryId other)) {
            return false;
        }
        return Objects.equals(oeuvreId, other.oeuvreId)
                && Objects.equals(categoryId, other.categoryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(oeuvreId, categoryId);
    }
}