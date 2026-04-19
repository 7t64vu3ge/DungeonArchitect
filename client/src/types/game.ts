export type CardType = "room" | "trap" | "monster" | "disaster";

export type GameStatus = "waiting" | "active" | "completed" | "abandoned";

export interface UserProfile {
  id: number;
  username: string;
  email: string;
}

export interface CardViewModel {
  id: number;
  name: string;
  type: CardType;
  cost: number;
  description?: string;
  imageUrl?: string;
}

export interface DungeonElementViewModel {
  id: number;
  type: CardType;
  cardId: number;
  cardName: string;
  imageUrl?: string;
}

export interface DungeonViewModel {
  id: number;
  health: number;
  elements: DungeonElementViewModel[];
}

export interface PlayerViewModel {
  id: number;
  userId: number;
  username: string;
  health: number;
  hand: CardViewModel[];
  dungeon: DungeonViewModel;
  isCurrentTurn: boolean;
}

export interface GameLogViewModel {
  id: number;
  action: string;
  createdAt: string;
}

export interface GameSessionViewModel {
  id: number;
  status: GameStatus;
  currentTurnPlayerId: number | null;
  players: PlayerViewModel[];
  logs: GameLogViewModel[];
}

export interface PlayCardAction {
  gameId: number;
  playerId: number;
  cardId: number;
  targetPlayerId?: number;
}
