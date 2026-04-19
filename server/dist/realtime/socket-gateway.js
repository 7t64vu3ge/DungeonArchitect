"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketGateway = initSocketGateway;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const game_engine_1 = require("../engine/core/game-engine");
const unit_registry_1 = require("../engine/cards/unit-registry");
const Game_1 = require("../database/models/Game");
const User_1 = require("../database/models/User");
// ── In-memory stores ────────────────────────
const matchQueue = [];
const activeGames = new Map();
const playerToGame = new Map(); // usedId -> gameId
const socketToUser = new Map();
// ── Tick intervals per game ─────────────────
const tickIntervals = new Map();
function initSocketGateway(io) {
    // ── Auth middleware ─────────────────────────
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error("No token"));
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "fallback-secret");
            socket.userId = decoded.userId;
            socket.username = decoded.username;
            next();
        }
        catch {
            next(new Error("Invalid token"));
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.userId;
        const username = socket.username;
        socketToUser.set(socket.id, { userId, username });
        console.log(`[Socket] ${username} connected (${socket.id})`);
        // ── Join Queue ────────────────────────────
        socket.on("join-queue", () => {
            // Don't let them queue twice
            if (matchQueue.find(p => p.userId === userId))
                return;
            // Don't let them queue if already in game
            if (playerToGame.has(userId)) {
                socket.emit("error-msg", "You are already in a game");
                return;
            }
            matchQueue.push({ socketId: socket.id, userId, username });
            socket.emit("queue-status", { position: matchQueue.length });
            console.log(`[Queue] ${username} joined (${matchQueue.length} in queue)`);
            // Try to match
            if (matchQueue.length >= 2) {
                const p1 = matchQueue.shift();
                const p2 = matchQueue.shift();
                startGame(io, p1, p2);
            }
        });
        // ── Leave Queue ───────────────────────────
        socket.on("leave-queue", () => {
            const idx = matchQueue.findIndex(p => p.userId === userId);
            if (idx !== -1)
                matchQueue.splice(idx, 1);
        });
        // ── Place Defense ─────────────────────────
        socket.on("place-defense", (data) => {
            const gameId = playerToGame.get(userId);
            if (!gameId)
                return;
            const state = activeGames.get(gameId);
            if (!state)
                return;
            try {
                game_engine_1.GameEngine.placeDefense(state, userId, data.slotIndex, data.cardId);
                broadcastState(io, state);
            }
            catch (err) {
                socket.emit("error-msg", err.message);
            }
        });
        // ── Player Ready ──────────────────────────
        socket.on("player-ready", () => {
            const gameId = playerToGame.get(userId);
            if (!gameId)
                return;
            const state = activeGames.get(gameId);
            if (!state)
                return;
            try {
                game_engine_1.GameEngine.setPlayerReady(state, userId);
                broadcastState(io, state);
                // If battle started, begin tick loop
                if (state.phase === "battle" && !tickIntervals.has(gameId)) {
                    startTickLoop(io, gameId);
                }
            }
            catch (err) {
                socket.emit("error-msg", err.message);
            }
        });
        // ── Place Attacker ────────────────────────
        socket.on("place-attacker", (data) => {
            const gameId = playerToGame.get(userId);
            if (!gameId)
                return;
            const state = activeGames.get(gameId);
            if (!state)
                return;
            try {
                game_engine_1.GameEngine.placeAttacker(state, userId, data.cardId, data.targetSlotIndex);
                broadcastState(io, state);
            }
            catch (err) {
                socket.emit("error-msg", err.message);
            }
        });
        // ── Get card catalogs ─────────────────────
        socket.on("get-cards", () => {
            socket.emit("cards-catalog", {
                defense: unit_registry_1.DEFENSE_CARDS,
                attack: unit_registry_1.ATTACK_CARDS,
            });
        });
        // ── Disconnect ────────────────────────────
        socket.on("disconnect", () => {
            console.log(`[Socket] ${username} disconnected`);
            socketToUser.delete(socket.id);
            // Remove from queue
            const idx = matchQueue.findIndex(p => p.userId === userId);
            if (idx !== -1)
                matchQueue.splice(idx, 1);
            // Handle game abandonment
            const gameId = playerToGame.get(userId);
            if (gameId) {
                const state = activeGames.get(gameId);
                if (state && state.phase !== "finished") {
                    state.phase = "finished";
                    const winner = state.players.find(p => p.userId !== userId);
                    state.winnerId = winner?.userId || null;
                    state.logs.push({
                        timestamp: Date.now(),
                        message: `${username} disconnected. ${winner?.username} wins!`,
                    });
                    broadcastState(io, state);
                    cleanupGame(gameId);
                }
            }
        });
    });
}
// ── Start a game between two players ────────
async function startGame(io, p1, p2) {
    const state = game_engine_1.GameEngine.createGame(p1.userId, p1.username, p2.userId, p2.username);
    activeGames.set(state.gameId, state);
    playerToGame.set(p1.userId, state.gameId);
    playerToGame.set(p2.userId, state.gameId);
    // Save game to DB
    try {
        await Game_1.Game.create({
            gameId: state.gameId,
            playerIds: [p1.userId, p2.userId],
            phase: "setup",
        });
    }
    catch { /* OK if fails, game still works in memory */ }
    // Put both sockets in a room
    const p1Socket = io.sockets.sockets.get(p1.socketId);
    const p2Socket = io.sockets.sockets.get(p2.socketId);
    p1Socket?.join(state.gameId);
    p2Socket?.join(state.gameId);
    console.log(`[Game] Started ${state.gameId}: ${p1.username} vs ${p2.username}`);
    broadcastState(io, state);
    // Setup timer — force battle start after 30s
    setTimeout(() => {
        const currentState = activeGames.get(state.gameId);
        if (currentState && currentState.phase === "setup") {
            game_engine_1.GameEngine.startBattle(currentState);
            broadcastState(io, currentState);
            if (!tickIntervals.has(state.gameId)) {
                startTickLoop(io, state.gameId);
            }
        }
    }, 30000);
}
// ── Tick loop for combat ────────────────────
function startTickLoop(io, gameId) {
    const interval = setInterval(() => {
        const state = activeGames.get(gameId);
        if (!state || state.phase !== "battle") {
            clearInterval(interval);
            tickIntervals.delete(gameId);
            return;
        }
        game_engine_1.GameEngine.tick(state);
        broadcastState(io, state);
        if (game_engine_1.GameEngine.isFinished(state)) {
            clearInterval(interval);
            tickIntervals.delete(gameId);
            cleanupGame(gameId);
        }
    }, 500); // tick every 500ms for network efficiency
    tickIntervals.set(gameId, interval);
}
// ── Broadcast state to all players in room ──
function broadcastState(io, state) {
    io.to(state.gameId).emit("game-state", state);
}
// ── Cleanup after game ends ─────────────────
async function cleanupGame(gameId) {
    const state = activeGames.get(gameId);
    if (!state)
        return;
    // Persist final state
    try {
        await Game_1.Game.findOneAndUpdate({ gameId }, {
            phase: "finished",
            winnerId: state.winnerId,
            stateSnapshot: JSON.stringify(state),
            endedAt: new Date(),
        });
        // Update user stats
        if (state.winnerId) {
            await User_1.User.findByIdAndUpdate(state.winnerId, { $inc: { wins: 1 } });
            const loserId = state.players.find(p => p.userId !== state.winnerId)?.userId;
            if (loserId) {
                await User_1.User.findByIdAndUpdate(loserId, { $inc: { losses: 1 } });
            }
        }
    }
    catch (err) {
        console.error("[DB] Failed to persist game result:", err);
    }
    // Clean up maps after a delay (let clients see final state)
    setTimeout(() => {
        for (const p of state.players) {
            playerToGame.delete(p.userId);
        }
        activeGames.delete(gameId);
    }, 5000);
}
//# sourceMappingURL=socket-gateway.js.map