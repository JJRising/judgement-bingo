package com.jjrising.bingo.game.db;

import com.jjrising.bingo.encryption.KeyHierarchyTree;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KeyHierarchy {

    @Id
    @Column(nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tree_json", nullable = false, columnDefinition = "jsonb")
    private KeyHierarchyTree tree;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    private void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
