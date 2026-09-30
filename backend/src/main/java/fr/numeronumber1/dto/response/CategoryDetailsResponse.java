package fr.numeronumber1.dto.response;

import java.util.List;

public record CategoryDetailsResponse(
        String id,
        String name,
        List<OeuvreResponse> works) {
}