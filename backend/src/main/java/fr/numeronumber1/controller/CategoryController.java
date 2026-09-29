package fr.numeronumber1.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.numeronumber1.dto.request.CategoryRequest;
import fr.numeronumber1.dto.response.CategoryDetailsResponse;
import fr.numeronumber1.dto.response.CategoryResponse;
import fr.numeronumber1.dto.response.OeuvreResponse;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.security.RequireAdmin;
import fr.numeronumber1.service.CategoryService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @RequireAdmin
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        Category category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CategoryResponse(category));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(
                categoryService.getAllCategories().stream()
                        .map(CategoryResponse::new)
                        .toList()
        );
    }

    @GetMapping("/{id}")
        public ResponseEntity<CategoryDetailsResponse> getCategoryById(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
            toCategoryDetailsResponse(categoryService.getCategoryById(id))
        );
    }

    @GetMapping("/name/{name}")
        public ResponseEntity<CategoryDetailsResponse> getCategoryByName(
            @PathVariable String name) {

        return ResponseEntity.ok(
            toCategoryDetailsResponse(categoryService.getCategoryByName(name))
        );
    }

    @DeleteMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<Void> deleteCategory( @PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @RequireAdmin
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Integer id,
            @Valid @RequestBody CategoryRequest request) {

        Category category = categoryService.updateCategory(id, request);

        return ResponseEntity.ok(new CategoryResponse(category));
    }

    @GetMapping("/{id}/works")
    public ResponseEntity<Page<OeuvreResponse>> getPublishedWorksByCategory(
            @PathVariable Integer id,
            Pageable pageable) {

        return ResponseEntity.ok(
                categoryService.getPublishedWorksByCategoryId(id, pageable)
                        .map(OeuvreResponse::new)
        );
    }

    private CategoryDetailsResponse toCategoryDetailsResponse(Category category) {
        List<OeuvreResponse> works = categoryService
                .getPublishedWorksByCategoryId(category.getCategoryId(), Pageable.unpaged())
                .getContent().stream()
                .map(OeuvreResponse::new)
                .toList();

        return new CategoryDetailsResponse(
                category.getCategoryId().toString(),
                category.getName(),
                works
        );
    }
}

