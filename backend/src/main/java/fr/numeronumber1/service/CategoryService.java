package fr.numeronumber1.service;

import fr.numeronumber1.dto.request.CategoryRequest;
import fr.numeronumber1.exception.CategoryAlreadyExistsException;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.CategoryRepository;
import fr.numeronumber1.repository.OeuvreCategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final  OeuvreCategoryRepository oeuvreCategoryRepository;

    public CategoryService(CategoryRepository categoryRepository, OeuvreCategoryRepository oeuvreCategoryRepository) {
        this.categoryRepository = categoryRepository;
        this.oeuvreCategoryRepository = oeuvreCategoryRepository;
    }

    public Category createCategory(CategoryRequest request) {

        if (categoryRepository.existsByName(request.getName())) {
            throw new CategoryAlreadyExistsException( "Une catégorie avec ce nom existe déjà");
        }
        Category category = new Category();
        category.setName(request.getName());

        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Catégorie introuvable avec l'id : " + id
                        ));
    }

    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Catégorie introuvable avec le nom : " + name
                        ));
    }

    public void deleteCategory(Integer id) {

        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Catégorie introuvable avec l'id : " + id
            );
        }

        categoryRepository.deleteById(id);
    }

    public Category updateCategory(Integer id, CategoryRequest request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Catégorie introuvable avec l'id : " + id
                        ));

        if (categoryRepository.existsByName(request.getName())
                && !category.getName().equals(request.getName())) {

            throw new CategoryAlreadyExistsException(
                    "Une catégorie avec ce nom existe déjà"
            );
        }

        category.setName(request.getName());

        return categoryRepository.save(category);
    }

    public Page<Oeuvre> getPublishedWorksByCategoryId(Integer categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Catégorie introuvable avec l'id : " + categoryId
                        ));

        return oeuvreCategoryRepository.findPublishedWorksByCategory(
                category.getCategoryId(),
                OeuvreStatus.approved,
                pageable
        );
    }
}
