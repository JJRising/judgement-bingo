package com.jjrising.bingo.encryption;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

public class KeyHierarchyBuilder {

    public static KeyHierarchyTree build(List<UUID> players) {
        if (players.isEmpty()) {
            throw new IllegalArgumentException("Cannot build hierarchy with zero players");
        }

        // For Unique Node naming
        AtomicInteger nodeCounter = new AtomicInteger(0);

        // Create leaf nodes
        List<BuildNode> currentLevel = players.stream()
                .map(p -> new BuildNode(
                        "K_" + nodeCounter.getAndIncrement(),
                        List.of(),
                        List.of(p)
                ))
                .collect(Collectors.toList());

        // Build tree bottom-up
        while (currentLevel.size() > 1) {
            currentLevel = pairNodesToBuildLevel(currentLevel, nodeCounter);
        }

        BuildNode root = currentLevel.getFirst();

        // Flatten into JSON-friendly structure
        Map<String, KeyHierarchyTree.Node> nodes = new HashMap<>();
        flatten(root, nodes);

        return new KeyHierarchyTree(root.nodeId, nodes);
    }

    private static List<BuildNode> pairNodesToBuildLevel(List<BuildNode> currentLevel, AtomicInteger nodeCounter) {
        List<BuildNode> nextLevel = new ArrayList<>();

        for (int i = 0; i < currentLevel.size(); i += 2) {
            if (i + 1 < currentLevel.size()) {
                BuildNode left = currentLevel.get(i);
                BuildNode right = currentLevel.get(i + 1);

                nextLevel.add(new BuildNode(
                        "K_" + nodeCounter.getAndIncrement(),
                        List.of(left, right),
                        List.of()
                ));
            } else {
                // Odd node promoted unchanged
                nextLevel.add(currentLevel.get(i));
            }
        }
        return nextLevel;
    }

    private static void flatten(
            BuildNode node,
            Map<String, KeyHierarchyTree.Node> out
    ) {
        out.put(
                node.nodeId,
                new KeyHierarchyTree.Node(
                        node.nodeId,
                        node.children.stream().map(c -> c.nodeId).toList(),
                        node.playerIds
                )
        );

        node.children.forEach(child -> flatten(child, out));
    }

    private record BuildNode(String nodeId, List<BuildNode> children, List<UUID> playerIds) {
    }
}
