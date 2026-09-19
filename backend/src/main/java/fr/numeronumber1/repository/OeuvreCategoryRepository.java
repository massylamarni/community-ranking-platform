package fr.numeronumber1.repository;

import fr.numeronumber1.model.OeuvreCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OeuvreCategoryRepository extends JpaRepository<OeuvreCategory, Long> {
}
