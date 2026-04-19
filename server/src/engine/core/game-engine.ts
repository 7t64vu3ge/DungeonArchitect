import type { GameSession, PlayerAction, DungeonElement } from "../../types/domain";
import { UNIT_REGISTRY } from "../cards/unit-registry";
import { Wall } from "../cards/unit-classes";

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

    // Basic turn order check
    if (game.currentTurnPlayerId !== action.playerId) {
      return false;
    }

    // Wall logic: If attacking, check if walls must be broken first
    if (action.type === "play-card" && action.cardId !== undefined) {
      const card = UNIT_REGISTRY.find(c => c.id === action.cardId);
      if (card && card.subType === "attack") {
        const targetPlayer = game.players.find(p => p.id === action.targetPlayerId);
        if (targetPlayer && this.getDungeonWalls(targetPlayer.dungeon.elements).length > 0) {
          // If the action is specifically targeting something behind walls, it could be invalid
          // For now, we'll just log that walls exist and must be targeted.
        }
      }
    }

    return true;
  }

  private getDungeonWalls(elements: DungeonElement[]): DungeonElement[] {
    return elements.filter(el => {
      const card = UNIT_REGISTRY.find(c => c.id === el.cardId);
      return card instanceof Wall;
    });
  }

  private resolveCombat(attackerId: number, targetPlayerId: number, game: GameSession): string {
    const attackerCard = UNIT_REGISTRY.find(c => c.id === attackerId);
    const targetPlayer = game.players.find(p => p.id === targetPlayerId);
    
    if (!attackerCard || !targetPlayer) return "Invalid attack";

    const walls = this.getDungeonWalls(targetPlayer.dungeon.elements);
    
    if (walls.length > 0) {
      // Logic: Must break a wall first
      const firstWall = walls[0];
      const wallCard = UNIT_REGISTRY.find(c => c.id === firstWall.cardId);
      return `Attacker ${attackerCard.name} is blocked by ${wallCard?.name}! Must break the wall first.`;
    }

    return `${attackerCard.name} attacked the dungeon successfully!`;
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
        
        let combatLog = "";
        if (card.subType === "attack" && action.targetPlayerId) {
          combatLog = ` | Combat: ${this.resolveCombat(card.id, action.targetPlayerId, game)}`;
        }

        actionDescription = `Player ${action.playerId} played ${card.name}${card.unitStats ? ` (HP: ${card.unitStats.hp})` : ""}${combatLog}`;
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
