package com.jjrising.bingo.encryption;

import lombok.Value;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Value
public class KeyHierarchyTree {
    String rootNodeId;
    Map<String, Node> nodes;

    @Value
    public static class Node {
        String nodeId;
        List<String> children;
        List<UUID> playerIds;
    }
}
