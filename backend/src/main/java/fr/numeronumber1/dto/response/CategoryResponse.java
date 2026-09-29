package fr.numeronumber1.dto.response;

import fr.numeronumber1.model.Category;

public record CategoryResponse(String id, String name) {

    public CategoryResponse(Category category) {
        this(category.getCategoryId().toString(), category.getName());
    }
}