package fr.numeronumber1.controller;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import static org.mockito.Mockito.when;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.OeuvreCategory;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.service.CategoryService;

class CategoryControllerTest {

    private CategoryService categoryService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        categoryService = Mockito.mock(CategoryService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new CategoryController(categoryService))
            .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
            .build();
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

    @Test
    void getCategoryById_includesPublishedWorksAsDtos() throws Exception {
        Category category = new Category();
        category.setCategoryId(7);
        category.setName("Design");

        User author = new User();
        author.setUsername("alice");
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(12L);
        oeuvre.setTitle("Work title");
        oeuvre.setDescription("Work description");
        oeuvre.setStatus(OeuvreStatus.approved);
        oeuvre.setAuthor(author);
        OeuvreCategory relation = new OeuvreCategory();
        relation.setCategory(category);
        relation.setOeuvre(oeuvre);
        category.setOeuvreCategories(List.of(relation));
        oeuvre.setOeuvreCategories(List.of(relation));
        when(categoryService.getCategoryById(7)).thenReturn(category);
        when(categoryService.getPublishedWorksByCategoryId(Mockito.eq(7), Mockito.any()))
                .thenReturn(new PageImpl<>(List.of(oeuvre), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/categories/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("7"))
                .andExpect(jsonPath("$.name").value("Design"))
                .andExpect(jsonPath("$.works[0].id").value(12))
                .andExpect(jsonPath("$.works[0].author").value("alice"))
                .andExpect(jsonPath("$.categoryId").doesNotExist())
                .andExpect(jsonPath("$.oeuvreCategories").doesNotExist())
                .andExpect(jsonPath("$.works[0].oeuvreId").doesNotExist())
                .andExpect(jsonPath("$.works[0].oeuvreCategories").doesNotExist());
    }

    @Test
    void categoryWorks_returnsOeuvreResponseDtos() throws Exception {
        User author = new User();
        author.setUsername("alice");

        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(12L);
        oeuvre.setTitle("Work title");
        oeuvre.setDescription("Work description");
        oeuvre.setStatus(OeuvreStatus.approved);
        oeuvre.setAuthor(author);

        when(categoryService.getPublishedWorksByCategoryId(Mockito.eq(7), Mockito.any()))
                .thenReturn(new PageImpl<>(List.of(oeuvre), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/categories/7/works"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(12))
                .andExpect(jsonPath("$.content[0].author").value("alice"))
                .andExpect(jsonPath("$.content[0].oeuvreId").doesNotExist())
                .andExpect(jsonPath("$.content[0].oeuvreCategories").doesNotExist());
    }
}