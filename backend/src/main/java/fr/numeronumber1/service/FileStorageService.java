package fr.numeronumber1.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

    @Value("${app.upload.dir:/uploads}")
    private String uploadDir;

    public String store(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("La taille du fichier dépasse la limite autorisée de 5 Mo");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Format de fichier non supporté. Formats acceptés : JPEG, PNG, WEBP, GIF");
        }

        String extension = getExtension(file.getOriginalFilename(), contentType);
        String filename = UUID.randomUUID() + extension;

        try {
            Path targetDir = Paths.get(uploadDir, subfolder).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(filename).normalize();
            try (InputStream is = file.getInputStream()) {
                Files.copy(is, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/" + subfolder + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier", e);
        }
    }

    private String getExtension(String originalFilename, String contentType) {
        if (originalFilename != null && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            if (ext.equals(".jpg") || ext.equals(".jpeg") || ext.equals(".png") || ext.equals(".webp") || ext.equals(".gif")) {
                return ext;
            }
        }
        return switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
