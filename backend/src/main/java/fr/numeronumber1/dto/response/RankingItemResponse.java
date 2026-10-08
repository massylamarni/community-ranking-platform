package fr.numeronumber1.dto.response;

import java.util.List;
import java.util.stream.Collectors;

import fr.numeronumber1.model.Oeuvre;

public class RankingItemResponse {

    private Long id;
    private String title;
    private String author;
    private String imageUrl;
    private List<String> categories;
    private int score;
    private int position;

    public RankingItemResponse(Oeuvre oeuvre, int score, int position) {
        this.id = oeuvre.getOeuvreId();
        this.title = oeuvre.getTitle();
        this.author = oeuvre.getAuthor().getUsername();
        this.imageUrl = oeuvre.getImageUrl();
        this.categories = oeuvre.getOeuvreCategories().stream()
                .map(oc -> oc.getCategory().getName())
                .collect(Collectors.toList());
        this.score = score;
        this.position = position;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getImageUrl() { return imageUrl; }
    public List<String> getCategories() { return categories; }
    public int getScore() { return score; }
    public int getPosition() { return position; }
}
