package com.jjrising.bingo.security.authorities;

import com.jjrising.bingo.security.auth.IdentityProviderType;
import com.jjrising.bingo.security.db.AppUser;
import com.jjrising.bingo.security.db.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
public class GoogleAuthoritiesMapper implements AuthoritiesMapper  {

    private final AppUserRepository appUserRepository;

    @Override
    public IdentityProviderType provider() {
        return IdentityProviderType.GOOGLE;
    }

    @Override
    public Collection<? extends GrantedAuthority> mapFrom(Jwt jwt) {
        String email = jwt.getClaim("email");
        assert email != null;
        AppUser user = appUserRepository.findByEmail(email).orElseThrow();
        if (user.getIsAdmin()) {
            return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_END_USER"));
        } else {
            return List.of(new SimpleGrantedAuthority("ROLE_END_USER"));
        }
    }
}
