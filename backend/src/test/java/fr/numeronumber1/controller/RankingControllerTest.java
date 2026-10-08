package fr.numeronumber1.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import fr.numeronumber1.dto.response.RankingItemResponse;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.OeuvreCategory;
import fr.numeronumber1.model.OeuvreCategoryId;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.service.RankingService;

class RankingControllerTest {

    private RankingService rankingService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        rankingService = Mockito.mock(RankingService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new RankingController(rankingService))
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
    }

    private Oeuvre createOeuvre(Long id, String title, int score, String categoryName) {
        User author = new User();
        author.setUserId(1);
        author.setUsername("creator");

        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(id);
        oeuvre.setTitle(title);
        oeuvre.setAuthor(author);
        oeuvre.setStatus(OeuvreStatus.approved);
        oeuvre.setScore(score);

        if (categoryName != null) {
            Category cat = new Category();
            cat.setCategoryId(10);
            cat.setName(categoryName);

            OeuvreCategory oc = new OeuvreCategory();
            oc.setId(new OeuvreCategoryId(id, cat.getCategoryId()));
            oc.setOeuvre(oeuvre);
            oc.setCategory(cat);
            oeuvre.getOeuvreCategories().add(oc);
        }

        return oeuvre;
    }

    @Test
    void getGlobalRanking_returnsHttp200AndPage() throws Exception {
        Oeuvre b = createOeuvre(2L, "B", 15, "Photographie");
        Oeuvre a = createOeuvre(1L, "A", 9, "Musique");

        RankingItemResponse itemB = new RankingItemResponse(b, 15, 1);
        RankingItemResponse itemA = new RankingItemResponse(a, 9, 2);

        PageRequest pageRequest = PageRequest.of(0, 20);
        PageImpl<RankingItemResponse> page = new PageImpl<>(List.of(itemB, itemA), pageRequest, 2);

        when(rankingService.getGlobalRanking(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/rankings/global?page=0&size=20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(2))
                .andExpect(jsonPath("$.content[0].title").value("B"))
                .andExpect(jsonPath("$.content[0].score").value(15))
                .andExpect(jsonPath("$.content[0].position").value(1))
                .andExpect(jsonPath("$.content[0].categories[0]").value("Photographie"))
                .andExpect(jsonPath("$.content[1].id").value(1))
                .andExpect(jsonPath("$.content[1].title").value("A"))
                .andExpect(jsonPath("$.content[1].score").value(9))
                .andExpect(jsonPath("$.content[1].position").value(2))
                .andExpect(jsonPath("$.totalElements").value(2));

        verify(rankingService).getGlobalRanking(any(Pageable.class));
    }

    @Test
    void getRankings_withCategoryId_returnsFilteredPage() throws Exception {
        Oeuvre b = createOeuvre(2L, "B", 15, "Photographie");
        RankingItemResponse itemB = new RankingItemResponse(b, 15, 1);

        PageRequest pageRequest = PageRequest.of(0, 20);
        PageImpl<RankingItemResponse> page = new PageImpl<>(List.of(itemB), pageRequest, 1);

        when(rankingService.getRanking(org.mockito.ArgumentMatchers.eq(10), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/rankings?categoryId=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("B"))
                .andExpect(jsonPath("$.content[0].score").value(15))
                .andExpect(jsonPath("$.content[0].position").value(1))
                .andExpect(jsonPath("$.totalElements").value(1));

        verify(rankingService).getRanking(org.mockito.ArgumentMatchers.eq(10), any(Pageable.class));
    }
}
