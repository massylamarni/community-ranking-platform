package fr.numeronumber1.steps;

import org.springframework.mock.web.MockHttpSession;
import org.springframework.stereotype.Component;

import io.cucumber.spring.ScenarioScope;

@Component
@ScenarioScope
public class AcceptanceScenarioContext {

    private MockHttpSession session;
    private String username;
    private boolean administrator;
    private Integer categoryId;
    private String categoryName;
    private Long oeuvreId;
    private String workTitle;
    private String workDescription;
    private String imageFileName;
    private String imageUrl;
    private Integer commentId;
    private String commentContent;
    private int responseStatus;
    private String responseBody = "";

    public void clear() {
        session = null;
        username = null;
        administrator = false;
        categoryId = null;
        categoryName = null;
        oeuvreId = null;
        workTitle = null;
        workDescription = null;
        imageFileName = null;
        imageUrl = null;
        commentId = null;
        commentContent = null;
        responseStatus = 0;
        responseBody = "";
    }

    public MockHttpSession getSession() { return session; }
    public void setSession(MockHttpSession session) { this.session = session; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public boolean isAdministrator() { return administrator; }
    public void setAdministrator(boolean administrator) { this.administrator = administrator; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Long getOeuvreId() { return oeuvreId; }
    public void setOeuvreId(Long oeuvreId) { this.oeuvreId = oeuvreId; }
    public String getWorkTitle() { return workTitle; }
    public void setWorkTitle(String workTitle) { this.workTitle = workTitle; }
    public String getWorkDescription() { return workDescription; }
    public void setWorkDescription(String workDescription) { this.workDescription = workDescription; }
    public String getImageFileName() { return imageFileName; }
    public void setImageFileName(String imageFileName) { this.imageFileName = imageFileName; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getCommentId() { return commentId; }
    public void setCommentId(Integer commentId) { this.commentId = commentId; }
    public String getCommentContent() { return commentContent; }
    public void setCommentContent(String commentContent) { this.commentContent = commentContent; }
    public int getResponseStatus() { return responseStatus; }
    public void setResponseStatus(int responseStatus) { this.responseStatus = responseStatus; }
    public String getResponseBody() { return responseBody; }
    public void setResponseBody(String responseBody) { this.responseBody = responseBody; }
}