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

    return {
      ...game,
      logs: [
        ...game.logs,
        {
          id: game.logs.length + 1,
          gameId: game.id,
          action: `${action.type} by player ${action.playerId}`,
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
