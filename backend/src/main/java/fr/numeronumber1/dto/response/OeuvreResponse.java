package fr.numeronumber1.dto.response;

import fr.numeronumber1.model.Oeuvre;

public class OeuvreResponse {

    private Long id;
    private String title;
    private String description;
    private String status;
    private String author;
    private String imageUrl;

    public OeuvreResponse(Oeuvre o) {
        this.id = o.getOeuvreId();
        this.title = o.getTitle();
        this.description = o.getDescription();
        this.status = o.getStatus().name();
        this.author = o.getAuthor().getUsername();
        this.imageUrl = o.getImageUrl();
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public String getAuthor() { return author; }
    public String getImageUrl() { return imageUrl; }
}
