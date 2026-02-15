package com.jjrising.bingo.game.db;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PromptRepository extends JpaRepository<Prompt, UUID> {
}
