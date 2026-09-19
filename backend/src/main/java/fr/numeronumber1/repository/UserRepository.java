package fr.numeronumber1.repository;

import fr.numeronumber1.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
