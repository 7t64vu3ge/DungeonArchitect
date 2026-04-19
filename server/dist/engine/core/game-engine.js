"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngineService = void 0;
const unit_registry_1 = require("../cards/unit-registry");
const CASTLE_HP = 2000;
const MAX_MANA = 10;
const START_MANA = 5;
const MANA_REGEN_INTERVAL = 1000;
const SETUP_DURATION = 30000;
const TICK_INTERVAL = 100;
const BOARD_SLOTS = 9;
function createEmptyBoard() {
    return Array.from({ length: BOARD_SLOTS }, (_, i) => ({
        index: i,
        cardId: null,
        currentHp: 0,
        maxHp: 0,
        lastAttackTime: 0,
    }));
}
function createPlayerState(userId, username) {
    return {
        userId,
        username,
        board: createEmptyBoard(),
        castleHp: CASTLE_HP,
        maxCastleHp: CASTLE_HP,
        castleSlotIndex: null,
        mana: START_MANA,
        maxMana: MAX_MANA,
        isReady: false,
        attackers: [],
    };
}
class GameEngineService {
    constructor(tickOrchestrator) {
        this.tickOrchestrator = tickOrchestrator;
    }
    createGame(p1Id, p1Name, p2Id, p2Name) {
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
    placeDefense(state, userId, slotIndex, cardId) {
        if (state.phase !== "setup")
            throw new Error("Not in setup phase");
        if (slotIndex < 0 || slotIndex >= BOARD_SLOTS)
            throw new Error("Invalid slot");
        const card = (0, unit_registry_1.getCardById)(cardId);
        if (!card || card.subType !== "defense")
            throw new Error("Not a defense card");
        const player = state.players.find(p => p.userId === userId);
        if (!player)
            throw new Error("Player not found");
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
    setPlayerReady(state, userId) {
        const player = state.players.find(p => p.userId === userId);
        if (!player)
            throw new Error("Player not found");
        if (player.castleSlotIndex === null)
            throw new Error("You must place your Castle first");
        player.isReady = true;
        if (state.players.every(p => p.isReady)) {
            return this.startBattle(state);
        }
        return state;
    }
    placeCastle(state, userId, slotIndex) {
        if (state.phase !== "setup")
            throw new Error("Not in setup phase");
        if (slotIndex < 0 || slotIndex >= BOARD_SLOTS)
            throw new Error("Invalid slot");
        const player = state.players.find(p => p.userId === userId);
        if (!player)
            throw new Error("Player not found");
        if (player.isReady)
            throw new Error("Already ready");
        player.castleSlotIndex = slotIndex;
        state.logs.push({
            timestamp: Date.now(),
            message: `${player.username} placed their Castle at slot ${slotIndex}`,
        });
        return state;
    }
    startBattle(state) {
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
    placeAttacker(state, userId, cardId, targetSlotIndex) {
        if (state.phase !== "battle")
            throw new Error("Not in battle");
        const card = (0, unit_registry_1.getCardById)(cardId);
        if (!card || card.subType !== "attack")
            throw new Error("Not an attack card");
        const attacker = state.players.find(p => p.userId === userId);
        if (!attacker)
            throw new Error("Player not found");
        if (attacker.mana < card.cost)
            throw new Error("Not enough mana");
        const opponent = state.players.find(p => p.userId !== userId);
        if (!opponent)
            throw new Error("No opponent");
        if (targetSlotIndex < 0 || targetSlotIndex >= BOARD_SLOTS)
            throw new Error("Invalid slot");
        attacker.mana -= card.cost;
        const uid = generateId();
        const activeAttacker = {
            uid,
            cardId: card.id,
            currentHp: card.unitStats?.hp ?? 100,
            maxHp: card.unitStats?.hp ?? 100,
            targetSlotIndex,
            lastAttackTime: Date.now(),
            ownerId: userId,
        };
        attacker.attackers.push(activeAttacker);
        state.logs.push({
            timestamp: Date.now(),
            message: `${attacker.username} deployed ${card.name} targeting slot ${targetSlotIndex}`,
        });
        return state;
    }
    tick(state) {
        return this.tickOrchestrator.update(state);
    }
    isFinished(state) {
        return state.phase === "finished";
    }
    getDefenseCards() {
        return unit_registry_1.DEFENSE_CARDS;
    }
    getAttackCards() {
        return unit_registry_1.ATTACK_CARDS;
    }
}
exports.GameEngineService = GameEngineService;
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}
//# sourceMappingURL=game-engine.js.map