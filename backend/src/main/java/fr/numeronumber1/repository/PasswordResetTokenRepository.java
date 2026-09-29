package fr.numeronumber1.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.numeronumber1.model.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {

    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUser_UserId(Integer userId);
}
