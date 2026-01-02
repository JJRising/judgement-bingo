package com.jjrising.bingo.security;

import com.jjrising.bingo.security.db.AppUser;
import com.jjrising.bingo.security.db.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserResolver {

    private final AppUserRepository appUserRepository;
    private final IdentityProviderProperties identityProviderProperties;

    public AppUser resolve(Jwt jwt) {
        // NB: This does not validate the JWT, that is done upstream of this resolver

        String issuer = jwt.getIssuer().toString();
        String subject = jwt.getSubject();

        IdentityProviderType identityProviderType = resolveIdentityProvider(issuer);

        String email = jwt.getClaimAsString("email");
        Boolean emailVerified = jwt.getClaimAsBoolean("email_verified");

        return appUserRepository.findByIdentityProviderTypeAndExternalSubjectId(identityProviderType, subject)
                .orElseGet(() -> createUser(identityProviderType, subject, email, emailVerified));
    }

    private AppUser createUser(
            IdentityProviderType provider,
            String subject,
            String email,
            Boolean emailVerified
    ) {
        AppUser user = AppUser.builder()
                .identityProviderType(provider)
                .externalSubjectId(subject)
                .email(email)
                .emailVerified(Boolean.TRUE.equals(emailVerified))
                .build();

        return appUserRepository.save(user);
    }

    IdentityProviderType resolveIdentityProvider(String issuer) {
        return identityProviderProperties.getIssuers().stream()
                .filter(m -> issuer.equals(m.getIssuer()))
                .findFirst()
                .map(IdentityProviderProperties.IssuerMapping::getProvider)
                .orElseThrow(() ->
                        new IllegalArgumentException("Unknown issuer: " + issuer)
                );
    }
}
