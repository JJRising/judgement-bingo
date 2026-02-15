package com.jjrising.bingo.security.auth;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.net.URL;
import java.util.List;

@Data
@ConfigurationProperties(prefix = "bingo.security.identity-providers")
public class IdentityProviderProperties {

    private List<IssuerMapping> issuers;

    @Data
    public static class IssuerMapping {
        private String issuer;
        private IdentityProviderType provider;
    }

    public IdentityProviderType resolveProvider(URL issuerUrl) {
        String issuerString = issuerUrl.toString();

        return issuers.stream()
                .filter(mapping -> mapping.getIssuer().equals(issuerString))
                .map(IssuerMapping::getProvider)
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Unknown identity provider for issuer: " + issuerUrl)
                );
    }
}
