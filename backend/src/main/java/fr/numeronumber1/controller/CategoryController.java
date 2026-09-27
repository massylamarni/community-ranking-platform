package fr.numeronumber1.controller;

import fr.numeronumber1.dto.request.CategoryRequest;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.security.RequireAdmin;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import fr.numeronumber1.service.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @RequireAdmin
    public ResponseEntity<Category> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        Category category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(
                categoryService.getAllCategories()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                categoryService.getCategoryById(id)
        );
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<Category> getCategoryByName(
            @PathVariable String name) {

        return ResponseEntity.ok(
                categoryService.getCategoryByName(name)
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
    public ResponseEntity<Category> updateCategory(
            @PathVariable Integer id,
            @Valid @RequestBody CategoryRequest request) {

        Category category = categoryService.updateCategory(id, request);

        return ResponseEntity.ok(category);
    }

    @GetMapping("/{id}/works")
    public ResponseEntity<Page<Oeuvre>> getPublishedWorksByCategory(
            @PathVariable Integer id,
            Pageable pageable) {

        return ResponseEntity.ok(
                categoryService.getPublishedWorksByCategoryId(id, pageable)
        );
    }
}

