package com.jjrising.bingo.security;

import com.jjrising.bingo.security.auth.IdentityProviderProperties;
import com.jjrising.bingo.security.auth.IdentityProviderType;
import com.jjrising.bingo.security.db.AppUser;
import com.jjrising.bingo.security.db.AppUserRepository;
import com.jjrising.bingo.security.dto.UserRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AppUserRepository appUserRepository;
    private final IdentityProviderProperties identityProviderProperties;

    public List<AppUser> getAllAppUsers() {
        return appUserRepository.findAll();
    }

    public AppUser addUserForInvite(UserRequest userRequest) {
        AppUser user = AppUser.builder().inviteName(userRequest.inviteName()).email(userRequest.email()).build();
        return appUserRepository.save(user);
    }

    public AppUser getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            String subject_id = jwt.getSubject();
            IdentityProviderType identityProviderType = identityProviderProperties.resolveProvider(jwt.getIssuer());
            return appUserRepository.findByIdentityProviderTypeAndExternalSubjectId(identityProviderType, subject_id).orElseThrow();
        }
        throw new IllegalStateException("No JWT authentication in security context");
    }
}
