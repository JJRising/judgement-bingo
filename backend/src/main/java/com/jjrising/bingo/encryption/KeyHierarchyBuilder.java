package com.jjrising.bingo.encryption;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

public class KeyHierarchyBuilder {

    public static KeyHierarchyTree build(List<UUID> players) {
        // TODO Build HierarchyTree based on number of players provided
        return new KeyHierarchyTree("K_root", new HashMap<>());
    }
}
