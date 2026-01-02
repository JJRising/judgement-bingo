package com.jjrising.bingo.security.authorities;

import com.jjrising.bingo.security.auth.IdentityProviderType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class KeyCloakAuthoritiesMapper implements AuthoritiesMapper {

    @Override
    public IdentityProviderType provider() {
        return IdentityProviderType.KEYCLOAK;
    }

    @Override
    public Collection<? extends GrantedAuthority> mapFrom(Jwt jwt) {
        Set<String> roles = new HashSet<>();
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess != null) {
            Object rawRoles = realmAccess.get("roles");
            if (rawRoles instanceof Collection<?> c) {
                c.forEach(r -> roles.add("ROLE_" + r.toString().toUpperCase()));
            }
        }
        return roles.stream().map(SimpleGrantedAuthority::new).toList();
    }
}
