package fr.numeronumber1.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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

import fr.numeronumber1.dto.response.RankingItemResponse;
import fr.numeronumber1.model.Category;
import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.OeuvreCategory;
import fr.numeronumber1.model.OeuvreCategoryId;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.repository.OeuvreRepository;

@ExtendWith(MockitoExtension.class)
class RankingServiceTest {

    @Mock
    private OeuvreRepository oeuvreRepository;

    @InjectMocks
    private RankingService rankingService;

    private User author;
    private Category musicCategory;
    private Category photoCategory;

    @BeforeEach
    void setUp() {
        author = new User();
        author.setUserId(1);
        author.setUsername("artist1");

        musicCategory = new Category();
        musicCategory.setCategoryId(10);
        musicCategory.setName("Musique");

        photoCategory = new Category();
        photoCategory.setCategoryId(20);
        photoCategory.setName("Photographie");
    }

    private Oeuvre createOeuvre(Long id, String title, int score, Category category) {
        Oeuvre oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(id);
        oeuvre.setTitle(title);
        oeuvre.setDescription("Description " + title);
        oeuvre.setAuthor(author);
        oeuvre.setStatus(OeuvreStatus.approved);
        oeuvre.setScore(score);

        if (category != null) {
            OeuvreCategory oc = new OeuvreCategory();
            oc.setId(new OeuvreCategoryId(id, category.getCategoryId()));
            oc.setOeuvre(oeuvre);
            oc.setCategory(category);
            oeuvre.getOeuvreCategories().add(oc);
        }

        return oeuvre;
    }

    @Test
    void getGlobalRanking_returnsPublishedWorksSortedByScoreDescending() {
        Pageable pageable = PageRequest.of(0, 10);

        Oeuvre oeuvreB = createOeuvre(2L, "B", 15, photoCategory);
        Oeuvre oeuvreA = createOeuvre(1L, "A", 9, musicCategory);
        Oeuvre oeuvreC = createOeuvre(3L, "C", 3, null);

        List<Oeuvre> oeuvreList = List.of(oeuvreB, oeuvreA, oeuvreC);
        Page<Oeuvre> oeuvrePage = new PageImpl<>(oeuvreList, pageable, 3);

        when(oeuvreRepository.findByStatusOrderByScoreDesc(eq(OeuvreStatus.approved), eq(pageable)))
                .thenReturn(oeuvrePage);

        Page<RankingItemResponse> result = rankingService.getGlobalRanking(pageable);

        assertNotNull(result);
        assertEquals(3, result.getTotalElements());
        assertEquals(3, result.getContent().size());

        RankingItemResponse first = result.getContent().get(0);
        assertEquals("B", first.getTitle());
        assertEquals(15, first.getScore());
        assertEquals(1, first.getPosition());
        assertEquals("artist1", first.getAuthor());
        assertEquals(List.of("Photographie"), first.getCategories());

        RankingItemResponse second = result.getContent().get(1);
        assertEquals("A", second.getTitle());
        assertEquals(9, second.getScore());
        assertEquals(2, second.getPosition());
        assertEquals(List.of("Musique"), second.getCategories());

        RankingItemResponse third = result.getContent().get(2);
        assertEquals("C", third.getTitle());
        assertEquals(3, third.getScore());
        assertEquals(3, third.getPosition());
        assertTrue(third.getCategories().isEmpty());

        verify(oeuvreRepository).findByStatusOrderByScoreDesc(OeuvreStatus.approved, pageable);
    }

    @Test
    void getGlobalRanking_calculatesCorrectPositionWithPagination() {
        Pageable pageable = PageRequest.of(1, 2); // page index 1, size 2 -> start position = 3

        Oeuvre oeuvre3 = createOeuvre(3L, "Work 3", 8, null);
        Oeuvre oeuvre4 = createOeuvre(4L, "Work 4", 5, null);

        Page<Oeuvre> page = new PageImpl<>(List.of(oeuvre3, oeuvre4), pageable, 5);

        when(oeuvreRepository.findByStatusOrderByScoreDesc(eq(OeuvreStatus.approved), eq(pageable)))
                .thenReturn(page);

        Page<RankingItemResponse> result = rankingService.getGlobalRanking(pageable);

        assertEquals(2, result.getContent().size());
        assertEquals(3, result.getContent().get(0).getPosition());
        assertEquals(4, result.getContent().get(1).getPosition());
    }

    @Test
    void getGlobalRanking_emptyWhenNoApprovedWorks() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Oeuvre> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

        when(oeuvreRepository.findByStatusOrderByScoreDesc(eq(OeuvreStatus.approved), eq(pageable)))
                .thenReturn(emptyPage);

        Page<RankingItemResponse> result = rankingService.getGlobalRanking(pageable);

        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());
    }

    @Test
    void getRanking_withCategoryId_returnsFilteredWorksByScoreDescending() {
        Pageable pageable = PageRequest.of(0, 10);
        Integer categoryId = photoCategory.getCategoryId();

        Oeuvre oeuvreB = createOeuvre(2L, "B", 15, photoCategory);
        Oeuvre oeuvreA = createOeuvre(1L, "A", 9, photoCategory);

        Page<Oeuvre> oeuvrePage = new PageImpl<>(List.of(oeuvreB, oeuvreA), pageable, 2);

        when(oeuvreRepository.findByStatusAndCategoryIdOrderByScoreDesc(
                eq(OeuvreStatus.approved), eq(categoryId), eq(pageable)))
                .thenReturn(oeuvrePage);

        Page<RankingItemResponse> result = rankingService.getRanking(categoryId, pageable);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals("B", result.getContent().get(0).getTitle());
        assertEquals(1, result.getContent().get(0).getPosition());
        assertEquals("A", result.getContent().get(1).getTitle());
        assertEquals(2, result.getContent().get(1).getPosition());

        verify(oeuvreRepository).findByStatusAndCategoryIdOrderByScoreDesc(
                OeuvreStatus.approved, categoryId, pageable);
    }
}
