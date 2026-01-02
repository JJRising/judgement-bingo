package com.jjrising.bingo.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

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
}
