package com.jjrising.bingo.security.auth;

import com.jjrising.bingo.security.db.AppUser;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;

public class AppUserAuthenticationToken extends AbstractAuthenticationToken {

    private final AppUser user;
    private final Jwt jwt;

    public AppUserAuthenticationToken(AppUser user, Jwt jwt, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.user = user;
        this.jwt = jwt;
        setAuthenticated(true);
    }

    @Override
    public Object getPrincipal() {
        return user;
    }

    @Override
    public Object getCredentials() {
        return jwt;
    }
}
