package com.jjrising.bingo.security.authorities;

import com.jjrising.bingo.security.IdentityProviderType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;

public interface AuthoritiesMapper {

    IdentityProviderType provider();
    Collection<? extends GrantedAuthority> mapFrom(Jwt jwt);
}
