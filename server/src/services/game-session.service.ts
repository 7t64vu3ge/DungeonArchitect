import { GameState } from "../types/domain";

export interface IGameSessionService {
  createSession(gameState: GameState): void;
  removeSession(gameId: string): void;
  getSession(gameId: string): GameState | undefined;
  mapPlayerToGame(userId: string, gameId: string): void;
  unmapPlayer(userId: string): void;
  getGameIdForPlayer(userId: string): string | undefined;
  getAllActiveSessions(): GameState[];
}

export class GameSessionService implements IGameSessionService {
  private activeGames: Map<string, GameState> = new Map();
  private playerToGame: Map<string, string> = new Map();

  public createSession(gameState: GameState): void {
    this.activeGames.set(gameState.gameId, gameState);
  }

  public removeSession(gameId: string): void {
    this.activeGames.delete(gameId);
  }

  public getSession(gameId: string): GameState | undefined {
    return this.activeGames.get(gameId);
  }

  public mapPlayerToGame(userId: string, gameId: string): void {
    this.playerToGame.set(userId, gameId);
  }

  public unmapPlayer(userId: string): void {
    this.playerToGame.delete(userId);
  }

  public getGameIdForPlayer(userId: string): string | undefined {
    return this.playerToGame.get(userId);
  }

  public getAllActiveSessions(): GameState[] {
    return Array.from(this.activeGames.values());
  }
}
