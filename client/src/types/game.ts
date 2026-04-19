// ── Shared types mirroring server domain ────

export type GamePhase = "waiting" | "setup" | "battle" | "finished";

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
  type: string;
  subType?: "defense" | "attack";
  cost: number;
  description?: string;
  unitStats?: UnitStats;
  imageUrl?: string;
}

export interface BoardSlot {
  index: number;
  cardId: number | null;
  currentHp: number;
  maxHp: number;
  lastAttackTime: number;
}

export interface ActiveAttacker {
  uid: string;
  cardId: number;
  currentHp: number;
  maxHp: number;
  targetSlotIndex: number;
  lastAttackTime: number;
  ownerId: string;
}

export interface PlayerState {
  userId: string;
  username: string;
  board: BoardSlot[];
  castleHp: number;
  maxCastleHp: number;
  mana: number;
  maxMana: number;
  isReady: boolean;
  attackers: ActiveAttacker[];
}

export interface GameState {
  gameId: string;
  phase: GamePhase;
  players: [PlayerState, PlayerState];
  setupDeadline: number;
  battleStartTime: number;
  lastTickTime: number;
  winnerId: string | null;
  logs: { timestamp: number; message: string }[];
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  wins: number;
  losses: number;
}
