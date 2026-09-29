package fr.numeronumber1.service;

import fr.numeronumber1.dto.request.CategoryRequest;
import fr.numeronumber1.exception.CategoryAlreadyExistsException;
import fr.numeronumber1.exception.ResourceNotFoundException;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.CategoryRepository;
import fr.numeronumber1.repository.OeuvreCategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
        import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private OeuvreCategoryRepository oeuvreCategoryRepository;


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




    @Test
    void shouldReturnPublishedWorksByCategory() {
        Integer categoryId = 1;

        Category category = new Category();
        category.setCategoryId(categoryId);
        category.setName("Musique");

        Pageable pageable = PageRequest.of(0, 10);

        Oeuvre oeuvre1 = new Oeuvre();
        oeuvre1.setOeuvreId(1L);
        oeuvre1.setTitle("Œuvre 1");

        Oeuvre oeuvre2 = new Oeuvre();
        oeuvre2.setOeuvreId(2L);
        oeuvre2.setTitle("Œuvre 2");

        Page<Oeuvre> expectedPage = new PageImpl<>(
                List.of(oeuvre1, oeuvre2),
                pageable,
                2
        );

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(oeuvreCategoryRepository.findPublishedWorksByCategory(
                categoryId,
                OeuvreStatus.approved,
                pageable
        )).thenReturn(expectedPage);

        Page<Oeuvre> result =
                categoryService.getPublishedWorksByCategoryId(categoryId, pageable);

        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertEquals("Œuvre 1", result.getContent().get(0).getTitle());
        assertEquals("Œuvre 2", result.getContent().get(1).getTitle());
        assertEquals(0, result.getNumber());
        assertEquals(10, result.getSize());
        assertEquals(2, result.getTotalElements());

        verify(categoryRepository).findById(categoryId);

        verify(oeuvreCategoryRepository).findPublishedWorksByCategory(
                categoryId,
                OeuvreStatus.approved,
                pageable
        );
    }

    @Test
    void shouldThrowExceptionWhenCategoryDoesNotExist() {
        Integer categoryId = 999;
        Pageable pageable = PageRequest.of(0, 10);

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> categoryService.getPublishedWorksByCategoryId(
                        categoryId,
                        pageable
                )
        );

        assertEquals(
                "Catégorie introuvable avec l'id : " + categoryId,
                exception.getMessage()
        );

        verify(categoryRepository).findById(categoryId);

        verify(
                oeuvreCategoryRepository,
                never()
        ).findPublishedWorksByCategory(
                anyInt(),
                any(OeuvreStatus.class),
                any(Pageable.class)
        );
    }

    @Test
    void shouldReturnEmptyPageWhenCategoryHasNoPublishedWorks() {
        Integer categoryId = 1;

        Category category = new Category();
        category.setCategoryId(categoryId);
        category.setName("Musique");

        Pageable pageable = PageRequest.of(0, 10);

        Page<Oeuvre> emptyPage = new PageImpl<>(
                List.of(),
                pageable,
                0
        );

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(oeuvreCategoryRepository.findPublishedWorksByCategory(
                categoryId,
                OeuvreStatus.approved,
                pageable
        )).thenReturn(emptyPage);

        Page<Oeuvre> result =
                categoryService.getPublishedWorksByCategoryId(
                        categoryId,
                        pageable
                );

        assertNotNull(result);
        assertTrue(result.isEmpty());
        assertEquals(0, result.getTotalElements());

        verify(oeuvreCategoryRepository).findPublishedWorksByCategory(
                categoryId,
                OeuvreStatus.approved,
                pageable
        );
    }

    @Test
    void shouldRequestOnlyApprovedWorks() {
        Integer categoryId = 1;
        Pageable pageable = PageRequest.of(0, 10);

        Category category = new Category();
        category.setCategoryId(categoryId);
        category.setName("Musique");

        Page<Oeuvre> page = Page.empty(pageable);

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(oeuvreCategoryRepository.findPublishedWorksByCategory(
                categoryId,
                OeuvreStatus.approved,
                pageable
        )).thenReturn(page);

        categoryService.getPublishedWorksByCategoryId(categoryId, pageable);

        verify(oeuvreCategoryRepository).findPublishedWorksByCategory(
                categoryId,
                OeuvreStatus.approved,
                pageable
        );

        verify(
                oeuvreCategoryRepository,
                never()
        ).findPublishedWorksByCategory(
                eq(categoryId),
                eq(OeuvreStatus.rejected),
                eq(pageable)
        );
    }
}