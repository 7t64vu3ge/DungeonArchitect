import { GameState, PlayerState, BoardSlot, ActiveAttacker } from "../../types/domain";
import { getCardById, DEFENSE_CARDS, ATTACK_CARDS } from "../cards/unit-registry";

const CASTLE_HP = 2000;
const MAX_MANA = 10;
const START_MANA = 5;
const MANA_REGEN_INTERVAL = 1000; // 1 mana per second
const SETUP_DURATION = 30000;     // 30 seconds
const TICK_INTERVAL = 100;        // combat tick every 100ms
const BOARD_SLOTS = 6;            // 3×2 grid

// ──────────────────────────────────────────────
// Helper: create an empty board
// ──────────────────────────────────────────────
function createEmptyBoard(): BoardSlot[] {
  return Array.from({ length: BOARD_SLOTS }, (_, i) => ({
    index: i,
    cardId: null,
    currentHp: 0,
    maxHp: 0,
    lastAttackTime: 0,
  }));
}

// ──────────────────────────────────────────────
// Helper: create a player state
// ──────────────────────────────────────────────
function createPlayerState(userId: string, username: string): PlayerState {
  return {
    userId,
    username,
    board: createEmptyBoard(),
    castleHp: CASTLE_HP,
    maxCastleHp: CASTLE_HP,
    mana: START_MANA,
    maxMana: MAX_MANA,
    isReady: false,
    attackers: [],
  };
}

// ──────────────────────────────────────────────
// Game Engine
// ──────────────────────────────────────────────
export class GameEngine {

  // ── Create a new game ───────────────────────
  static createGame(
    p1Id: string, p1Name: string,
    p2Id: string, p2Name: string
  ): GameState {
    const now = Date.now();
    return {
      gameId: generateId(),
      phase: "setup",
      players: [
        createPlayerState(p1Id, p1Name),
        createPlayerState(p2Id, p2Name),
      ],
      setupDeadline: now + SETUP_DURATION,
      battleStartTime: 0,
      lastTickTime: now,
      winnerId: null,
      logs: [{ timestamp: now, message: "Game started — place your defenses!" }],
    };
  }

  // ── Defense placement during setup ──────────
  static placeDefense(state: GameState, userId: string, slotIndex: number, cardId: number): GameState {
    if (state.phase !== "setup") throw new Error("Not in setup phase");
    if (slotIndex < 0 || slotIndex >= BOARD_SLOTS) throw new Error("Invalid slot");

    const card = getCardById(cardId);
    if (!card || card.subType !== "defense") throw new Error("Not a defense card");

    const player = state.players.find(p => p.userId === userId);
    if (!player) throw new Error("Player not found");

    const slot = player.board[slotIndex];
    slot.cardId = cardId;
    slot.currentHp = card.unitStats?.hp ?? 100;
    slot.maxHp = card.unitStats?.hp ?? 100;
    slot.lastAttackTime = 0;

    state.logs.push({
      timestamp: Date.now(),
      message: `${player.username} placed ${card.name} at slot ${slotIndex}`,
    });

    return state;
  }

  // ── Mark player as ready ────────────────────
  static setPlayerReady(state: GameState, userId: string): GameState {
    const player = state.players.find(p => p.userId === userId);
    if (!player) throw new Error("Player not found");
    player.isReady = true;

    // If both ready OR time expired, start battle
    if (state.players.every(p => p.isReady)) {
      return GameEngine.startBattle(state);
    }
    return state;
  }

  // ── Force start battle (timer expired) ──────
  static startBattle(state: GameState): GameState {
    const now = Date.now();
    state.phase = "battle";
    state.battleStartTime = now;
    state.lastTickTime = now;
    state.players.forEach(p => {
      p.isReady = true;
      p.mana = START_MANA;
    });
    state.logs.push({ timestamp: now, message: "Battle phase has begun!" });
    return state;
  }

  // ── Deploy an attacker onto opponent's board ─
  static placeAttacker(state: GameState, userId: string, cardId: number, targetSlotIndex: number): GameState {
    if (state.phase !== "battle") throw new Error("Not in battle");

    const card = getCardById(cardId);
    if (!card || card.subType !== "attack") throw new Error("Not an attack card");

    const attacker = state.players.find(p => p.userId === userId);
    if (!attacker) throw new Error("Player not found");

    if (attacker.mana < card.cost) throw new Error("Not enough mana");

    // Find opponent
    const opponent = state.players.find(p => p.userId !== userId);
    if (!opponent) throw new Error("No opponent");

    // Validate target slot
    if (targetSlotIndex < 0 || targetSlotIndex >= BOARD_SLOTS) throw new Error("Invalid slot");

    attacker.mana -= card.cost;

    const uid = generateId();
    const activeAttacker: ActiveAttacker = {
      uid,
      cardId: card.id,
      currentHp: card.unitStats?.hp ?? 100,
      maxHp: card.unitStats?.hp ?? 100,
      targetSlotIndex,
      lastAttackTime: Date.now(),
      ownerId: userId,
    };

    // Attackers are stored on the ATTACKER's state (they attack opponent's board)
    attacker.attackers.push(activeAttacker);

    state.logs.push({
      timestamp: Date.now(),
      message: `${attacker.username} deployed ${card.name} targeting slot ${targetSlotIndex}`,
    });

    return state;
  }

  // ── Main combat tick ────────────────────────
  static tick(state: GameState): GameState {
    if (state.phase !== "battle") return state;

    const now = Date.now();
    const deltaMs = now - state.lastTickTime;
    state.lastTickTime = now;

    // ── Mana regeneration ─────────────────────
    for (const player of state.players) {
      const manaGain = deltaMs / MANA_REGEN_INTERVAL;
      player.mana = Math.min(player.maxMana, player.mana + manaGain);
    }

    // ── Process each player's attackers ────────
    for (let pi = 0; pi < 2; pi++) {
      const attackerPlayer = state.players[pi];
      const defenderPlayer = state.players[1 - pi];

      // Filter out dead attackers
      attackerPlayer.attackers = attackerPlayer.attackers.filter(a => a.currentHp > 0);

      for (const atk of attackerPlayer.attackers) {
        const card = getCardById(atk.cardId);
        if (!card || !card.unitStats) continue;

        const interval = (card.unitStats.attackSpeed ?? 2) * 1000;
        if (now - atk.lastAttackTime < interval) continue;

        atk.lastAttackTime = now;
        const damage = card.unitStats.damage ?? 0;
        if (damage <= 0) continue; // medic etc.

        // Find target: the defense slot this attacker is targeting
        const targetSlot = defenderPlayer.board[atk.targetSlotIndex];

        if (targetSlot && targetSlot.cardId !== null && targetSlot.currentHp > 0) {
          // Attack the defense card
          targetSlot.currentHp -= damage;
          if (targetSlot.currentHp <= 0) {
            const defCard = getCardById(targetSlot.cardId);
            state.logs.push({
              timestamp: now,
              message: `${defCard?.name} at slot ${atk.targetSlotIndex} was destroyed by ${card.name}!`,
            });
            targetSlot.currentHp = 0;
            targetSlot.cardId = null;
          }
        } else {
          // No defense at slot — attack the castle
          defenderPlayer.castleHp -= damage;
          if (defenderPlayer.castleHp <= 0) {
            defenderPlayer.castleHp = 0;
            state.phase = "finished";
            state.winnerId = attackerPlayer.userId;
            state.logs.push({
              timestamp: now,
              message: `${attackerPlayer.username} destroyed ${defenderPlayer.username}'s castle! GG!`,
            });
            return state;
          }
        }
      }

      // ── Defense towers attack back ────────────
      for (const slot of defenderPlayer.board) {
        if (slot.cardId === null || slot.currentHp <= 0) continue;

        const defCard = getCardById(slot.cardId);
        if (!defCard || !defCard.unitStats) continue;

        const damage = defCard.unitStats.damage ?? 0;
        if (damage <= 0) continue; // walls don't attack

        const interval = (defCard.unitStats.attackSpeed ?? 2) * 1000;
        if (now - slot.lastAttackTime < interval) continue;
        slot.lastAttackTime = now;

        // Find an attacker targeting this slot (or any attacker on this side)
        const targetAtk = attackerPlayer.attackers.find(
          a => a.targetSlotIndex === slot.index && a.currentHp > 0
        ) || attackerPlayer.attackers.find(a => a.currentHp > 0);

        if (targetAtk) {
          targetAtk.currentHp -= damage;
          if (targetAtk.currentHp <= 0) {
            const atkCard = getCardById(targetAtk.cardId);
            state.logs.push({
              timestamp: now,
              message: `${defCard.name} destroyed ${atkCard?.name}!`,
            });
          }
        }
      }
    }

    // Clean up dead attackers
    for (const player of state.players) {
      player.attackers = player.attackers.filter(a => a.currentHp > 0);
    }

    return state;
  }

  // ── Check if game is over ───────────────────
  static isFinished(state: GameState): boolean {
    return state.phase === "finished";
  }

  // ── Get available defense cards ─────────────
  static getDefenseCards() {
    return DEFENSE_CARDS;
  }

  // ── Get available attack cards ──────────────
  static getAttackCards() {
    return ATTACK_CARDS;
  }
}

// ── Simple ID generator ─────────────────────
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}
