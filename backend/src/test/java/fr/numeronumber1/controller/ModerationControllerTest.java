package fr.numeronumber1.controller;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import fr.numeronumber1.model.Oeuvre;
import fr.numeronumber1.model.User;
import fr.numeronumber1.model.enums.OeuvreStatus;
import fr.numeronumber1.service.ModerationService;

class ModerationControllerTest {

    private ModerationService moderationService;
    private MockMvc mockMvc;
    private Oeuvre oeuvre;

    @BeforeEach
    void setUp() {
        moderationService = org.mockito.Mockito.mock(ModerationService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(
                new ModerationController(moderationService)
        ).setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver()).build();

        User author = new User();
        author.setUsername("alice");

        oeuvre = new Oeuvre();
        oeuvre.setOeuvreId(12L);
        oeuvre.setTitle("Work title");
        oeuvre.setDescription("Work description");
        oeuvre.setStatus(OeuvreStatus.pending);
        oeuvre.setAuthor(author);
        oeuvre.setOeuvreCategories(new ArrayList<>());
        oeuvre.setVotes(new ArrayList<>());
    }

    @Test
    void pendingWorksAreSerializedAsOeuvreResponseDtos() throws Exception {
        when(moderationService.getPendingWorks(org.mockito.ArgumentMatchers.any()))
                .thenReturn(new PageImpl<>(List.of(oeuvre), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/moderation/works"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(12))
                .andExpect(jsonPath("$.content[0].author").value("alice"))
                .andExpect(jsonPath("$.content[0].status").value("pending"))
                .andExpect(jsonPath("$.content[0].oeuvreId").doesNotExist())
                .andExpect(jsonPath("$.content[0].author.passwordHash").doesNotExist());
    }

    @Test
    void acceptedWorkIsSerializedAsOeuvreResponseDto() throws Exception {
        oeuvre.setStatus(OeuvreStatus.approved);
        when(moderationService.accept(12L)).thenReturn(oeuvre);

        mockMvc.perform(post("/moderation/works/12/accept"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(12))
                .andExpect(jsonPath("$.author").value("alice"))
                .andExpect(jsonPath("$.status").value("approved"))
                .andExpect(jsonPath("$.oeuvreId").doesNotExist());
    }
}