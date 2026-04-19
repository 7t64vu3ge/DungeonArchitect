// ──────────────────────────────────────────────
// Domain types for Dungeon Architect
// ──────────────────────────────────────────────

export type CardType = "room" | "trap" | "monster" | "disaster";
export type GamePhase = "waiting" | "setup" | "battle" | "finished";

// ── Unit Stats ──────────────────────────────
export interface UnitStats {
  hp: number;
  damage?: number;
  range?: number;
  attackSpeed?: number;   // seconds between attacks
  spawnCount?: number;
  favoriteTarget?: string;
  ability?: string;
  disability?: string;
  distractedBy?: string;
}

// ── Card definition (static template) ───────
export interface Card {
  id: number;
  name: string;
  type: CardType;
  subType?: "defense" | "attack";
  cost: number;
  description?: string;
  unitStats?: UnitStats;
  imageUrl?: string;
}

// ── Board slot (runtime, in a game) ─────────
export interface BoardSlot {
  index: number;          // 0-5 in a 3×2 grid
  cardId: number | null;  // registry card ID placed here
  currentHp: number;
  maxHp: number;
  lastAttackTime: number; // timestamp of last attack tick
}

// ── Active attacker on the field ────────────
export interface ActiveAttacker {
  uid: string;            // unique runtime ID
  cardId: number;         // registry card
  currentHp: number;
  maxHp: number;
  targetSlotIndex: number; // which defense slot it's attacking
  lastAttackTime: number;
  ownerId: string;        // the player who deployed it
}

// ── Per-player game state ───────────────────
export interface PlayerState {
  oddsPlayed?: number;
  userId: string;
  username: string;
  board: BoardSlot[];     // 6 slots (3×2 grid)
  castleHp: number;
  maxCastleHp: number;
  castleSlotIndex: number | null; // which of the 9 slots holds the castle
  mana: number;
  maxMana: number;
  isReady: boolean;       // finished setup?
  attackers: ActiveAttacker[]; // attackers deployed BY this player onto the opponent
}

// ── Full game state ─────────────────────────
export interface GameState {
  gameId: string;
  phase: GamePhase;
  players: [PlayerState, PlayerState];
  setupDeadline: number;  // timestamp when setup ends
  battleStartTime: number;
  lastTickTime: number;
  winnerId: string | null;
  logs: GameLogEntry[];
}

// ── Log entry ───────────────────────────────
export interface GameLogEntry {
  timestamp: number;
  message: string;
}
