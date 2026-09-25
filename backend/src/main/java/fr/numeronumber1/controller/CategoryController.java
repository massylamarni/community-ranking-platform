package fr.numeronumber1.controller;

import fr.numeronumber1.dto.request.CategoryRequest;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.security.RequireAdmin;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import fr.numeronumber1.service.CategoryService;

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
}
