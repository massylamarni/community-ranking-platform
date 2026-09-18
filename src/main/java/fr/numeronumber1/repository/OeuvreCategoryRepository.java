package fr.numeronumber1.repository;

import fr.numeronumber1.model.OeuvreCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import fr.numeronumber1.model.OeuvreCategoryId;

public interface OeuvreCategoryRepository extends JpaRepository<OeuvreCategory, OeuvreCategoryId> {
}
