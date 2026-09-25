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

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        HttpStatus status = (request != null && request.getRequestURI() != null
                && (request.getRequestURI().startsWith("/auth/login") || request.getRequestURI().startsWith("/auth/register")))
                ? HttpStatus.BAD_REQUEST
                : HttpStatus.UNPROCESSABLE_ENTITY;

        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors())
            fields.put(fe.getField(), fe.getDefaultMessage());
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

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("status", status.value(), "error", message));
    }
}
