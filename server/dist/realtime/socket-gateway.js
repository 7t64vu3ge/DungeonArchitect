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
const matchmaking_service_1 = require("../services/matchmaking.service");
const game_session_service_1 = require("../services/game-session.service");
const combat_system_1 = require("../engine/systems/combat.system");
const mana_system_1 = require("../engine/systems/mana.system");
const game_tick_orchestrator_1 = require("../engine/systems/game-tick.orchestrator");
const tickIntervals = new Map();
const socketToUser = new Map();
function initSocketGateway(io) {
    const matchmakingService = new matchmaking_service_1.MatchmakingService();
    const gameSessionService = new game_session_service_1.GameSessionService();
    const gameEngine = new game_engine_1.GameEngineService(new game_tick_orchestrator_1.GameTickOrchestrator(new mana_system_1.ManaSystem(), new combat_system_1.CombatSystem()));
    const usernameMap = new Map();
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
        usernameMap.set(userId, username);
        console.log(`[Socket] ${username} connected (${socket.id})`);
        socket.on("join-queue", () => {
            if (matchmakingService.isInQueue(userId))
                return;
            if (gameSessionService.getGameIdForPlayer(userId)) {
                socket.emit("error-msg", "You are already in a game");
                return;
            }
            matchmakingService.addToQueue(userId);
            socket.emit("queue-status", { position: 1 });
            console.log(`[Queue] ${username} joined`);
            const match = matchmakingService.findMatch();
            if (match) {
                startGame(io, match[0], usernameMap.get(match[0]), match[1], usernameMap.get(match[1]), match[0], match[1], gameEngine, gameSessionService);
            }
        });
        socket.on("leave-queue", () => {
            matchmakingService.removeFromQueue(userId);
        });
        socket.on("place-defense", (data) => {
            const gameId = gameSessionService.getGameIdForPlayer(userId);
            if (!gameId)
                return;
            const state = gameSessionService.getSession(gameId);
            if (!state)
                return;
            try {
                gameEngine.placeDefense(state, userId, data.slotIndex, data.cardId);
                broadcastState(io, state);
            }
            catch (err) {
                socket.emit("error-msg", err.message);
            }
        });
        socket.on("place-castle", (data) => {
            const gameId = gameSessionService.getGameIdForPlayer(userId);
            if (!gameId)
                return;
            const state = gameSessionService.getSession(gameId);
            if (!state)
                return;
            try {
                gameEngine.placeCastle(state, userId, data.slotIndex);
                broadcastState(io, state);
            }
            catch (err) {
                socket.emit("error-msg", err.message);
            }
        });
        socket.on("player-ready", () => {
            const gameId = gameSessionService.getGameIdForPlayer(userId);
            if (!gameId)
                return;
            const state = gameSessionService.getSession(gameId);
            if (!state)
                return;
            try {
                gameEngine.setPlayerReady(state, userId);
                broadcastState(io, state);
                if (state.phase === "battle" && !tickIntervals.has(gameId)) {
                    startTickLoop(io, gameId, gameEngine, gameSessionService);
                }
            }
            catch (err) {
                socket.emit("error-msg", err.message);
            }
        });
        socket.on("place-attacker", (data) => {
            const gameId = gameSessionService.getGameIdForPlayer(userId);
            if (!gameId)
                return;
            const state = gameSessionService.getSession(gameId);
            if (!state)
                return;
            try {
                gameEngine.placeAttacker(state, userId, data.cardId, data.targetSlotIndex);
                broadcastState(io, state);
            }
            catch (err) {
                socket.emit("error-msg", err.message);
            }
        });
        socket.on("get-cards", () => {
            socket.emit("cards-catalog", {
                defense: unit_registry_1.DEFENSE_CARDS,
                attack: unit_registry_1.ATTACK_CARDS,
            });
        });
        socket.on("disconnect", () => {
            console.log(`[Socket] ${username} disconnected`);
            socketToUser.delete(socket.id);
            matchmakingService.removeFromQueue(userId);
            const gameId = gameSessionService.getGameIdForPlayer(userId);
            if (gameId) {
                const state = gameSessionService.getSession(gameId);
                if (state && state.phase !== "finished") {
                    state.phase = "finished";
                    const winner = state.players.find(p => p.userId !== userId);
                    state.winnerId = winner?.userId || null;
                    state.logs.push({
                        timestamp: Date.now(),
                        message: `${username} disconnected. ${winner?.username} wins!`,
                    });
                    broadcastState(io, state);
                    cleanupGame(gameId, gameSessionService);
                }
            }
        });
    });
}
async function startGame(io, p1Id, p1Name, p2Id, p2Name, p1SocketId, p2SocketId, gameEngine, gameSessionService) {
    const state = gameEngine.createGame(p1Id, p1Name, p2Id, p2Name);
    gameSessionService.createSession(state);
    gameSessionService.mapPlayerToGame(p1Id, state.gameId);
    gameSessionService.mapPlayerToGame(p2Id, state.gameId);
    try {
        await Game_1.Game.create({
            gameId: state.gameId,
            playerIds: [p1Id, p2Id],
            phase: "setup",
        });
    }
    catch { }
    const p1Socket = Array.from(io.sockets.sockets.values()).find(s => s.userId === p1Id);
    const p2Socket = Array.from(io.sockets.sockets.values()).find(s => s.userId === p2Id);
    if (p1Socket)
        p1Socket.join(state.gameId);
    if (p2Socket)
        p2Socket.join(state.gameId);
    console.log(`[Game] Started ${state.gameId}: ${p1Name} vs ${p2Name}`);
    broadcastState(io, state);
    setTimeout(() => {
        const currentState = gameSessionService.getSession(state.gameId);
        if (currentState && currentState.phase === "setup") {
            gameEngine.startBattle(currentState);
            broadcastState(io, currentState);
            if (!tickIntervals.has(state.gameId)) {
                startTickLoop(io, state.gameId, gameEngine, gameSessionService);
            }
        }
    }, 30000);
}
function startTickLoop(io, gameId, gameEngine, gameSessionService) {
    const interval = setInterval(() => {
        const state = gameSessionService.getSession(gameId);
        if (!state || state.phase !== "battle") {
            clearInterval(interval);
            tickIntervals.delete(gameId);
            return;
        }
        gameEngine.tick(state);
        broadcastState(io, state);
        if (gameEngine.isFinished(state)) {
            clearInterval(interval);
            tickIntervals.delete(gameId);
            cleanupGame(gameId, gameSessionService);
        }
    }, 500);
    tickIntervals.set(gameId, interval);
}
function broadcastState(io, state) {
    io.to(state.gameId).emit("game-state", state);
}
async function cleanupGame(gameId, gameSessionService) {
    const state = gameSessionService.getSession(gameId);
    if (!state)
        return;
    try {
        await Game_1.Game.findOneAndUpdate({ gameId }, {
            phase: "finished",
            winnerId: state.winnerId,
            stateSnapshot: JSON.stringify(state),
            endedAt: new Date(),
        });
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
    setTimeout(() => {
        for (const p of state.players) {
            gameSessionService.unmapPlayer(p.userId);
        }
        gameSessionService.removeSession(gameId);
    }, 5000);
}
//# sourceMappingURL=socket-gateway.js.map