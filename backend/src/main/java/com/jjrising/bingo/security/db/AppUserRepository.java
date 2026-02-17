package com.jjrising.bingo.security.db;

import com.jjrising.bingo.security.auth.IdentityProviderType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByEmail(String email);

    Optional<AppUser> findByIdentityProviderTypeAndExternalSubjectId(IdentityProviderType identityProviderType, String subjectId);

    Optional<AppUser> findByEmailAndIdentityProviderTypeIsNull(String email);
}
