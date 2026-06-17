package com.mihir.springsightai.auth.repository;

import com.mihir.springsightai.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA Repository interface for accessing User data from the MySQL database.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Locate a user by their unique email.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user with the given email already exists.
     */
    boolean existsByEmail(String email);
}
