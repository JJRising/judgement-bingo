package com.jjrising.bingo.encryption;

import lombok.Value;

import java.util.List;
import java.util.UUID;

@Value
public class EncryptionManifest {

    UUID excludedSubjectId;
    String algorithm;
    List<KeyWrapper> keyWrappers;

    @Value
    public static class KeyWrapper {
        String nodeId;
        byte[] iv;
        byte[] wrappedKey;
    }
}
