package com.jjrising.bingo.encryption;

import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class KeyHierarchyBuilderTest {

    @Test
    void emptySetThrows() {
        assertThrows(
                IllegalArgumentException.class,
                () -> KeyHierarchyBuilder.build(List.of())
        );
    }

    @Test
    void singlePlayerCreatesSingleNodeTree() {
        UUID player = UUID.randomUUID();

        KeyHierarchyTree tree = KeyHierarchyBuilder.build(List.of(player));

        assertNotNull(tree.getRootNodeId());
        assertEquals(1, tree.getNodes().size());

        KeyHierarchyTree.Node root = tree.getNodes().get(tree.getRootNodeId());
        assertNotNull(root);
        assertTrue(root.getChildren().isEmpty());
        assertEquals(List.of(player), root.getPlayerIds());
    }

    @Test
    void allPlayersAppearExactlyOnce() {
        List<UUID> players = generatePlayers(7);

        KeyHierarchyTree tree = KeyHierarchyBuilder.build(players);

        List<UUID> allCoveredPlayers = tree.getNodes().values().stream()
                .flatMap(n -> n.getPlayerIds().stream())
                .toList();

        assertEquals(players.size(), allCoveredPlayers.size());
        assertTrue(players.containsAll(allCoveredPlayers));
    }

    @Test
    void allChildrenReferencesExist() {
        List<UUID> players = generatePlayers(10);

        KeyHierarchyTree tree = KeyHierarchyBuilder.build(players);

        Set<String> nodeIds = tree.getNodes().keySet();

        tree.getNodes().values().forEach(node ->
                node.getChildren().forEach(childId ->
                        assertTrue(
                                nodeIds.contains(childId),
                                "Missing child node: " + childId
                        )
                )
        );
    }

    @Test
    void treeHasSingleRoot() {
        List<UUID> players = generatePlayers(8);

        KeyHierarchyTree tree = KeyHierarchyBuilder.build(players);

        List<String> allChildren = tree.getNodes().values().stream()
                .flatMap(n -> n.getChildren().stream())
                .toList();

        assertFalse(allChildren.contains(tree.getRootNodeId()),
                "Root node should not be referenced as a child");
    }

    @Test
    void deterministicForSameInput() {
        List<UUID> players = generatePlayers(9);

        KeyHierarchyTree t1 = KeyHierarchyBuilder.build(players);
        KeyHierarchyTree t2 = KeyHierarchyBuilder.build(players);

        assertEquals(t1.getRootNodeId(), t2.getRootNodeId());
        assertEquals(t1.getNodes(), t2.getNodes());
    }

    @Test
    void roughlyBalancedTree() {
        List<UUID> players = generatePlayers(16);

        KeyHierarchyTree tree = KeyHierarchyBuilder.build(players);

        int maxDepth = computeMaxDepth(tree, tree.getRootNodeId(), 0);

        // log2(16) = 4 → allow a little slack
        assertTrue(maxDepth <= 6,
                "Tree is unexpectedly deep: " + maxDepth);
    }

    /* ---------------- Helpers ---------------- */

    private List<UUID> generatePlayers(int count) {
        List<UUID> ids = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            ids.add(UUID.randomUUID());
        }
        return ids;
    }

    private int computeMaxDepth(KeyHierarchyTree tree, String nodeId, int depth) {
        KeyHierarchyTree.Node node = tree.getNodes().get(nodeId);

        if (node.getChildren().isEmpty()) {
            return depth;
        }

        return node.getChildren().stream()
                .mapToInt(child -> computeMaxDepth(tree, child, depth + 1))
                .max()
                .orElse(depth);
    }
}
