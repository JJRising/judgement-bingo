package com.jjrising.bingo.security.auth;

import com.jjrising.bingo.security.db.AppUser;
import com.jjrising.bingo.security.db.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Optional;

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

        if (!emailVerified) {
            throw new RuntimeException("unverified email");
        }

        return appUserRepository.findByIdentityProviderTypeAndExternalSubjectId(identityProviderType, subject)
                .orElseGet(() -> resolveByEmail(identityProviderType, subject, email));
    }

    private AppUser resolveByEmail(IdentityProviderType identityProviderType, String subject, String email) {
        Optional<AppUser> appUserOptional = appUserRepository.findByEmailAndIdentityProviderTypeIsNull(email);
        if (appUserOptional.isPresent()) {
            AppUser appUser = appUserOptional.get();
            appUser.setIdentityProviderType(identityProviderType);
            appUser.setExternalSubjectId(subject);
            return appUserRepository.save(appUser);
        } else {
            throw new RuntimeException("User not found");
        }
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
