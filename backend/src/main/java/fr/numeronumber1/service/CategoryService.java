package fr.numeronumber1.service;

import fr.numeronumber1.dto.request.CategoryRequest;
import fr.numeronumber1.exception.CategoryAlreadyExistsException;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.repository.CategoryRepository;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category createCategory(CategoryRequest request) {

        if (categoryRepository.existsByName(request.getName())) {
            throw new CategoryAlreadyExistsException( "Une catégorie avec ce nom existe déjà");
        }
        Category category = new Category();
        category.setName(request.getName());

        return categoryRepository.save(category);
    }
}
