package fr.numeronumber1.dto.response;

import fr.numeronumber1.model.User;

public record AuthorResponse(Integer id, String username) {
    public AuthorResponse(User user) {
        this(user.getUserId(), user.getUsername());
    }
}
