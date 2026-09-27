package fr.numeronumber1.service;

import fr.numeronumber1.dto.request.CategoryRequest;
import fr.numeronumber1.exception.CategoryAlreadyExistsException;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
        import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private CategoryRequest request;

    @BeforeEach
    void setUp() {
        request = new CategoryRequest();
        request.setName("Musique");
    }

    @Test
    void shouldCreateCategoryWhenNameDoesNotExist() {

        when(categoryRepository.existsByName("Musique")).thenReturn(false);
        Category savedCategory = new Category();
        savedCategory.setCategoryId(1);
        savedCategory.setName("Musique");
        when(categoryRepository.save(any(Category.class)))
                .thenReturn(savedCategory);

        Category result = categoryService.createCategory(request);

        assertNotNull(result);
        assertEquals(1, result.getCategoryId());
        assertEquals("Musique", result.getName());

        verify(categoryRepository).existsByName("Musique");
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void shouldThrowExceptionWhenCategoryAlreadyExists() {
        when(categoryRepository.existsByName("Musique")).thenReturn(true);

        CategoryAlreadyExistsException exception = assertThrows(
                CategoryAlreadyExistsException.class,
                () -> categoryService.createCategory(request)
        );

        assertEquals(
                "Une catégorie avec ce nom existe déjà",
                exception.getMessage()
        );

        verify(categoryRepository).existsByName("Musique");

        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void shouldReturnAllCategories() {
        Category category1 = new Category();
        category1.setCategoryId(1);
        category1.setName("Musique");

        Category category2 = new Category();
        category2.setCategoryId(2);
        category2.setName("Cinéma");

        when(categoryRepository.findAll())
                .thenReturn(List.of(category1, category2));

        List<Category> result = categoryService.getAllCategories();

        assertNotNull(result);
        assertEquals(2, result.size());

        assertEquals("Musique", result.get(0).getName());
        assertEquals("Cinéma", result.get(1).getName());

        verify(categoryRepository).findAll();
    }

    @Test
    void shouldReturnEmptyListWhenNoCategoryExists() {
        when(categoryRepository.findAll())
                .thenReturn(List.of());

        List<Category> result = categoryService.getAllCategories();

        assertNotNull(result);
        assertTrue(result.isEmpty());

        verify(categoryRepository).findAll();
    }

    @Test
    void shouldUpdateCategory() {
        Category existingCategory = new Category();
        existingCategory.setCategoryId(1);
        existingCategory.setName("Musique");

        CategoryRequest request = new CategoryRequest();
        request.setName("Musique et Arts");

        when(categoryRepository.findById(1))
                .thenReturn(Optional.of(existingCategory));

        when(categoryRepository.existsByName("Musique et Arts"))
                .thenReturn(false);

        when(categoryRepository.save(existingCategory))
                .thenReturn(existingCategory);

        Category result = categoryService.updateCategory(1, request);

        assertNotNull(result);
        assertEquals(1, result.getCategoryId());
        assertEquals("Musique et Arts", result.getName());

        verify(categoryRepository).findById(1);
        verify(categoryRepository).existsByName("Musique et Arts");
        verify(categoryRepository).save(existingCategory);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingCategory() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Musique");

        when(categoryRepository.findById(999))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> categoryService.updateCategory(999, request)
        );

        assertEquals(
                "Catégorie introuvable avec l'id : 999",
                exception.getMessage()
        );

        verify(categoryRepository).findById(999);
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingWithExistingName() {
        Category existingCategory = new Category();
        existingCategory.setCategoryId(1);
        existingCategory.setName("Musique");

        CategoryRequest request = new CategoryRequest();
        request.setName("Cinéma");

        when(categoryRepository.findById(1))
                .thenReturn(Optional.of(existingCategory));

        when(categoryRepository.existsByName("Cinéma"))
                .thenReturn(true);

        CategoryAlreadyExistsException exception = assertThrows(
                CategoryAlreadyExistsException.class,
                () -> categoryService.updateCategory(1, request)
        );

        assertEquals(
                "Une catégorie avec ce nom existe déjà",
                exception.getMessage()
        );

        verify(categoryRepository).findById(1);
        verify(categoryRepository).existsByName("Cinéma");
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void shouldDeleteCategory() {
        when(categoryRepository.existsById(1))
                .thenReturn(true);

        categoryService.deleteCategory(1);

        verify(categoryRepository).existsById(1);
        verify(categoryRepository).deleteById(1);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistingCategory() {
        when(categoryRepository.existsById(999))
                .thenReturn(false);

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> categoryService.deleteCategory(999)
        );

        assertEquals(
                "Catégorie introuvable avec l'id : 999",
                exception.getMessage()
        );

        verify(categoryRepository).existsById(999);
        verify(categoryRepository, never()).deleteById(anyInt());
    }
}