import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { GameEngine } from "../engine/core/game-engine";
import { GameState } from "../types/domain";
import { DEFENSE_CARDS, ATTACK_CARDS } from "../engine/cards/unit-registry";
import { Game } from "../database/models/Game";
import { User } from "../database/models/User";

interface QueuePlayer {
  socketId: string;
  userId: string;
  username: string;
}

// ── In-memory stores ────────────────────────
const matchQueue: QueuePlayer[] = [];
const activeGames: Map<string, GameState> = new Map();
const playerToGame: Map<string, string> = new Map(); // usedId -> gameId
const socketToUser: Map<string, { userId: string; username: string }> = new Map();

// ── Tick intervals per game ─────────────────
const tickIntervals: Map<string, NodeJS.Timeout> = new Map();

export function initSocketGateway(io: Server) {

  // ── Auth middleware ─────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as {
        userId: string;
        username: string;
      };
      (socket as any).userId = decoded.userId;
      (socket as any).username = decoded.username;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    const username = (socket as any).username as string;
    socketToUser.set(socket.id, { userId, username });

    console.log(`[Socket] ${username} connected (${socket.id})`);

    // ── Join Queue ────────────────────────────
    socket.on("join-queue", () => {
      // Don't let them queue twice
      if (matchQueue.find(p => p.userId === userId)) return;
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
        const p1 = matchQueue.shift()!;
        const p2 = matchQueue.shift()!;
        startGame(io, p1, p2);
      }
    });

    // ── Leave Queue ───────────────────────────
    socket.on("leave-queue", () => {
      const idx = matchQueue.findIndex(p => p.userId === userId);
      if (idx !== -1) matchQueue.splice(idx, 1);
    });

    // ── Place Defense ─────────────────────────
    socket.on("place-defense", (data: { slotIndex: number; cardId: number }) => {
      const gameId = playerToGame.get(userId);
      if (!gameId) return;
      const state = activeGames.get(gameId);
      if (!state) return;

      try {
        GameEngine.placeDefense(state, userId, data.slotIndex, data.cardId);
        broadcastState(io, state);
      } catch (err: any) {
        socket.emit("error-msg", err.message);
      }
    });

    // ── Player Ready ──────────────────────────
    socket.on("player-ready", () => {
      const gameId = playerToGame.get(userId);
      if (!gameId) return;
      const state = activeGames.get(gameId);
      if (!state) return;

      try {
        GameEngine.setPlayerReady(state, userId);
        broadcastState(io, state);

        // If battle started, begin tick loop
        if (state.phase === "battle" && !tickIntervals.has(gameId)) {
          startTickLoop(io, gameId);
        }
      } catch (err: any) {
        socket.emit("error-msg", err.message);
      }
    });

    // ── Place Attacker ────────────────────────
    socket.on("place-attacker", (data: { cardId: number; targetSlotIndex: number }) => {
      const gameId = playerToGame.get(userId);
      if (!gameId) return;
      const state = activeGames.get(gameId);
      if (!state) return;

      try {
        GameEngine.placeAttacker(state, userId, data.cardId, data.targetSlotIndex);
        broadcastState(io, state);
      } catch (err: any) {
        socket.emit("error-msg", err.message);
      }
    });

    // ── Get card catalogs ─────────────────────
    socket.on("get-cards", () => {
      socket.emit("cards-catalog", {
        defense: DEFENSE_CARDS,
        attack: ATTACK_CARDS,
      });
    });

    // ── Disconnect ────────────────────────────
    socket.on("disconnect", () => {
      console.log(`[Socket] ${username} disconnected`);
      socketToUser.delete(socket.id);

      // Remove from queue
      const idx = matchQueue.findIndex(p => p.userId === userId);
      if (idx !== -1) matchQueue.splice(idx, 1);

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
async function startGame(io: Server, p1: QueuePlayer, p2: QueuePlayer) {
  const state = GameEngine.createGame(p1.userId, p1.username, p2.userId, p2.username);
  activeGames.set(state.gameId, state);
  playerToGame.set(p1.userId, state.gameId);
  playerToGame.set(p2.userId, state.gameId);

  // Save game to DB
  try {
    await Game.create({
      gameId: state.gameId,
      playerIds: [p1.userId, p2.userId],
      phase: "setup",
    });
  } catch { /* OK if fails, game still works in memory */ }

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
      GameEngine.startBattle(currentState);
      broadcastState(io, currentState);
      if (!tickIntervals.has(state.gameId)) {
        startTickLoop(io, state.gameId);
      }
    }
  }, 30000);
}

// ── Tick loop for combat ────────────────────
function startTickLoop(io: Server, gameId: string) {
  const interval = setInterval(() => {
    const state = activeGames.get(gameId);
    if (!state || state.phase !== "battle") {
      clearInterval(interval);
      tickIntervals.delete(gameId);
      return;
    }

    GameEngine.tick(state);
    broadcastState(io, state);

    if (GameEngine.isFinished(state)) {
      clearInterval(interval);
      tickIntervals.delete(gameId);
      cleanupGame(gameId);
    }
  }, 500); // tick every 500ms for network efficiency

  tickIntervals.set(gameId, interval);
}

// ── Broadcast state to all players in room ──
function broadcastState(io: Server, state: GameState) {
  io.to(state.gameId).emit("game-state", state);
}

// ── Cleanup after game ends ─────────────────
async function cleanupGame(gameId: string) {
  const state = activeGames.get(gameId);
  if (!state) return;

  // Persist final state
  try {
    await Game.findOneAndUpdate({ gameId }, {
      phase: "finished",
      winnerId: state.winnerId,
      stateSnapshot: JSON.stringify(state),
      endedAt: new Date(),
    });

    // Update user stats
    if (state.winnerId) {
      await User.findByIdAndUpdate(state.winnerId, { $inc: { wins: 1 } });
      const loserId = state.players.find(p => p.userId !== state.winnerId)?.userId;
      if (loserId) {
        await User.findByIdAndUpdate(loserId, { $inc: { losses: 1 } });
      }
    }
  } catch (err) {
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
