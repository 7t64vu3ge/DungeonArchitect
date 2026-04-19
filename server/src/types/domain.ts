export type CardType = "room" | "trap" | "monster" | "disaster";

export type GameStatus = "waiting" | "active" | "completed" | "abandoned";

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
}

export interface UnitStats {
  hp: number;
  damage?: number;
  range?: number;
  attackSpeed?: number;
  spawnCount?: number;
  favoriteTarget?: string;
  ability?: string;
  disability?: string;
  distractedBy?: string;
}

export interface Card {
  id: number;
  name: string;
  type: CardType;
  subType?: "defense" | "attack";
  cost: number;
  description?: string;
  unitStats?: UnitStats;
}

export interface DeckCard {
  id: number;
  deckId: number;
  cardId: number;
  position: number;
}

export interface Deck {
  id: number;
  gameId: number;
  cards: DeckCard[];
}

export interface DungeonElement {
  id: number;
  dungeonId: number;
  type: CardType;
  cardId: number;
}

export interface Dungeon {
  id: number;
  playerId: number;
  health: number;
  elements: DungeonElement[];
}

export interface Player {
  id: number;
  userId: number;
  gameId: number;
  health: number;
  hand: Card[];
  dungeon: Dungeon;
}

export interface GameLog {
  id: number;
  gameId: number;
  action: string;
  createdAt: Date;
}

export interface GameSession {
  id: number;
  status: GameStatus;
  currentTurnPlayerId: number | null;
  players: Player[];
  deck: Deck;
  logs: GameLog[];
  createdAt: Date;
  endedAt: Date | null;
}

export interface PlayerAction {
  gameId: number;
  playerId: number;
  type: "play-card" | "end-turn" | "draw-card" | "leave-game";
  cardId?: number;
  targetPlayerId?: number;
}
