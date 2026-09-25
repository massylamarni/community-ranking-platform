package fr.numeronumber1.service;

import fr.numeronumber1.dto.request.CategoryRequest;
import fr.numeronumber1.exception.CategoryAlreadyExistsException;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
}