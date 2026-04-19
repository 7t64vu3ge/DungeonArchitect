import type { GameSession, PlayerAction } from "../../types/domain";

export interface GameEngine {
  validateMove(game: GameSession, action: PlayerAction): boolean;
  applyMove(game: GameSession, action: PlayerAction): GameSession;
  checkWinCondition(game: GameSession): number | null;
}

export class DungeonGameEngine implements GameEngine {
  validateMove(game: GameSession, action: PlayerAction): boolean {
    if (game.status !== "active") {
      return false;
    }

    return game.currentTurnPlayerId === action.playerId;
  }

  applyMove(game: GameSession, action: PlayerAction): GameSession {
    if (!this.validateMove(game, action)) {
      throw new Error("Invalid move for current game state.");
    }

    let updatedPlayers = [...game.players];
    let actionDescription = `${action.type} by player ${action.playerId}`;

    if (action.type === "play-card" && action.cardId !== undefined) {
      const playerIndex = updatedPlayers.findIndex(p => p.id === action.playerId);
      const player = updatedPlayers[playerIndex];
      const card = player.hand.find(c => c.id === action.cardId);

      if (card) {
        // Place card in dungeon
        player.dungeon.elements.push({
          id: player.dungeon.elements.length + 1,
          dungeonId: player.dungeon.id,
          type: card.type,
          cardId: card.id
        });

        // Remove from hand
        player.hand = player.hand.filter(c => c.id !== action.cardId);
        
        actionDescription = `Player ${action.playerId} played ${card.name}${card.unitStats ? ` (HP: ${card.unitStats.hp})` : ""}`;
      }
    }

    return {
      ...game,
      players: updatedPlayers,
      logs: [
        ...game.logs,
        {
          id: game.logs.length + 1,
          gameId: game.id,
          action: actionDescription,
          createdAt: new Date(),
        },
      ],
    };
  }

  checkWinCondition(game: GameSession): number | null {
    const alivePlayers = game.players.filter((player) => player.health > 0);
    return alivePlayers.length === 1 ? alivePlayers[0].id : null;
  }
}
