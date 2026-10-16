package fr.numeronumber1.dto.response;

import java.util.List;

public record CommentPageResponse(
        List<CommentResponse> items,
        int page,
        int pageSize,
        long total) {
    public CommentPageResponse {
        items = List.copyOf(items);
    }
}
