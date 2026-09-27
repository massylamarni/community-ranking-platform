package fr.numeronumber1.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({MethodArgumentNotValidException.class, org.springframework.validation.BindException.class})
    public ResponseEntity<Map<String, Object>> handleValidation(org.springframework.validation.BindException ex, HttpServletRequest request) {
        HttpStatus status = (request != null && request.getRequestURI() != null
                && (request.getRequestURI().startsWith("/auth/login") || request.getRequestURI().startsWith("/auth/register")))
                ? HttpStatus.BAD_REQUEST
                : HttpStatus.UNPROCESSABLE_ENTITY;

        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            String message = fe.getDefaultMessage();
            if (fe.isBindingFailure() || "typeMismatch".equals(fe.getCode())) {
                if ("image".equals(fe.getField())) {
                    message = "L'image doit être un fichier valide";
                } else {
                    message = "Valeur ou format invalide pour ce champ";
                }
            }
            fields.put(fe.getField(), message);
        }
        return ResponseEntity.status(status).body(Map.of(
            "status", status.value(),
            "error", "Échec de la validation",
            "fields", fields));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMissingBody(HttpMessageNotReadableException ex) {
        return error(HttpStatus.BAD_REQUEST, "Corps de la requête manquant ou illisible");
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        return error(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return error(HttpStatus.FORBIDDEN, "Droits insuffisants pour effectuer cette action");
    }

    @ExceptionHandler(UnauthorizedActionException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedAction(UnauthorizedActionException ex) {
        return error(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler({UsernameAlreadyExistsException.class, EmailAlreadyExistsException.class, CategoryAlreadyExistsException.class})
    public ResponseEntity<Map<String, Object>> handleConflict(RuntimeException ex) {
        return error(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSize(org.springframework.web.multipart.MaxUploadSizeExceededException ex) {
        return error(HttpStatus.BAD_REQUEST, "La taille du fichier dépasse la limite autorisée de 5 Mo");
    }

    @ExceptionHandler(org.springframework.web.HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMediaTypeNotSupported(org.springframework.web.HttpMediaTypeNotSupportedException ex) {
        return error(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Format de contenu non supporté. Veuillez utiliser multipart/form-data");
    }

    @ExceptionHandler(org.springframework.web.multipart.MultipartException.class)
    public ResponseEntity<Map<String, Object>> handleMultipartException(org.springframework.web.multipart.MultipartException ex) {
        return error(HttpStatus.BAD_REQUEST, "Requête multipart attendue avec un fichier image (form-data)");
    }

    @ExceptionHandler({
        org.springframework.web.multipart.support.MissingServletRequestPartException.class,
        org.springframework.web.bind.MissingServletRequestParameterException.class
    })
    public ResponseEntity<Map<String, Object>> handleMissingParam(Exception ex) {
        return error(HttpStatus.BAD_REQUEST, "Le fichier image est manquant");
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("status", status.value(), "error", message));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {

        if ("id".equals(ex.getName())) {
            return error(
                    HttpStatus.BAD_REQUEST,
                    "L'identifiant doit être un nombre entier"
            );
        }

        return error(
                HttpStatus.BAD_REQUEST,
                "La valeur fournie pour le paramètre '" + ex.getName() + "' est invalide"
        );
    }
}
