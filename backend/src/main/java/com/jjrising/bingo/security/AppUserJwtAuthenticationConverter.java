package com.jjrising.bingo.security;

import com.jjrising.bingo.security.authorities.AuthoritiesMapper;
import com.jjrising.bingo.security.db.AppUser;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class AppUserJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final AppUserResolver resolver;
    private final Map<IdentityProviderType, AuthoritiesMapper> authoritiesMappers;

    public AppUserJwtAuthenticationConverter(AppUserResolver resolver, List<AuthoritiesMapper> authoritiesMappers) {
        this.resolver = resolver;
        this.authoritiesMappers = authoritiesMappers.stream()
                .collect(Collectors.toMap(AuthoritiesMapper::provider, Function.identity()));
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        AppUser user = resolver.resolve(jwt);
        Collection<? extends GrantedAuthority> authorities = authoritiesMappers.get(user.getIdentityProviderType()).mapFrom(jwt);
        return new AppUserAuthenticationToken(user, jwt, authorities);
    }
}
