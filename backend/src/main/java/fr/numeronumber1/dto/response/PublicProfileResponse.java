package fr.numeronumber1.dto.response;

import java.util.List;
import java.util.Map;

public record PublicProfileResponse(
        Integer userId,
        String username,
        List<Map<String, Object>> publishedWorks,
        List<Map<String, Object>> comments,
        List<Map<String, Object>> votedWorks
) {
}