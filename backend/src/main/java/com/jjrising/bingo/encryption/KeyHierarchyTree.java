package com.jjrising.bingo.encryption;

import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
@Jacksonized
public class KeyHierarchyTree {
    String rootNodeId;
    Map<String, Node> nodes;

    @Value
    @Builder
    @Jacksonized
    public static class Node {
        String nodeId;
        List<String> children;
        List<UUID> playerIds;
    }
}
