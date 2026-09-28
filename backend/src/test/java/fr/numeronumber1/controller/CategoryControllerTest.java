package fr.numeronumber1.controller;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.mockito.Mockito.when;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import fr.numeronumber1.model.Category;
import fr.numeronumber1.service.CategoryService;

class CategoryControllerTest {

    private CategoryService categoryService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        categoryService = Mockito.mock(CategoryService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new CategoryController(categoryService)).build();
    }

    @Test
    void getAllCategories_returnsFrontendAndOpenApiShape() throws Exception {
        Category category = new Category();
        category.setCategoryId(7);
        category.setName("Design");

        when(categoryService.getAllCategories()).thenReturn(List.of(category));

        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("7"))
                .andExpect(jsonPath("$[0].name").value("Design"))
                .andExpect(jsonPath("$[0].categoryId").doesNotExist())
                .andExpect(jsonPath("$[0].oeuvreCategories").doesNotExist());
    }
}