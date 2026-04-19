import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { GameEngineService } from "../engine/core/game-engine";
import { GameState } from "../types/domain";
import { DEFENSE_CARDS, ATTACK_CARDS } from "../engine/cards/unit-registry";
import { Game } from "../database/models/Game";
import { User } from "../database/models/User";
import { IMatchmakingService, MatchmakingService } from "../services/matchmaking.service";
import { IGameSessionService, GameSessionService } from "../services/game-session.service";
import { CombatSystem } from "../engine/systems/combat.system";
import { ManaSystem } from "../engine/systems/mana.system";
import { GameTickOrchestrator } from "../engine/systems/game-tick.orchestrator";

const tickIntervals: Map<string, NodeJS.Timeout> = new Map();
const socketToUser: Map<string, { userId: string; username: string }> = new Map();

export function initSocketGateway(io: Server) {
  const matchmakingService: IMatchmakingService = new MatchmakingService();
  const gameSessionService: IGameSessionService = new GameSessionService();
  const gameEngine = new GameEngineService(new GameTickOrchestrator(new ManaSystem(), new CombatSystem()));
  const usernameMap: Map<string, string> = new Map();

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
    usernameMap.set(userId, username);

    console.log(`[Socket] ${username} connected (${socket.id})`);

    socket.on("join-queue", () => {
      if (matchmakingService.isInQueue(userId)) return;
      if (gameSessionService.getGameIdForPlayer(userId)) {
        socket.emit("error-msg", "You are already in a game");
        return;
      }

      matchmakingService.addToQueue(userId);
      socket.emit("queue-status", { position: 1 });
      console.log(`[Queue] ${username} joined`);

      const match = matchmakingService.findMatch();
      if (match) {
        startGame(io, match[0], usernameMap.get(match[0])!, match[1], usernameMap.get(match[1])!, match[0], match[1], gameEngine, gameSessionService);
      }
    });

    socket.on("leave-queue", () => {
      matchmakingService.removeFromQueue(userId);
    });

    socket.on("place-defense", (data: { slotIndex: number; cardId: number }) => {
      const gameId = gameSessionService.getGameIdForPlayer(userId);
      if (!gameId) return;
      const state = gameSessionService.getSession(gameId);
      if (!state) return;

      try {
        gameEngine.placeDefense(state, userId, data.slotIndex, data.cardId);
        broadcastState(io, state);
      } catch (err: any) {
        socket.emit("error-msg", err.message);
      }
    });

    socket.on("place-castle", (data: { slotIndex: number }) => {
      const gameId = gameSessionService.getGameIdForPlayer(userId);
      if (!gameId) return;
      const state = gameSessionService.getSession(gameId);
      if (!state) return;

      try {
        gameEngine.placeCastle(state, userId, data.slotIndex);
        broadcastState(io, state);
      } catch (err: any) {
        socket.emit("error-msg", err.message);
      }
    });

    socket.on("player-ready", () => {
      const gameId = gameSessionService.getGameIdForPlayer(userId);
      if (!gameId) return;
      const state = gameSessionService.getSession(gameId);
      if (!state) return;

      try {
        gameEngine.setPlayerReady(state, userId);
        broadcastState(io, state);

        if (state.phase === "battle" && !tickIntervals.has(gameId)) {
          startTickLoop(io, gameId, gameEngine, gameSessionService);
        }
      } catch (err: any) {
        socket.emit("error-msg", err.message);
      }
    });

    socket.on("place-attacker", (data: { cardId: number; targetSlotIndex: number }) => {
      const gameId = gameSessionService.getGameIdForPlayer(userId);
      if (!gameId) return;
      const state = gameSessionService.getSession(gameId);
      if (!state) return;

      try {
        gameEngine.placeAttacker(state, userId, data.cardId, data.targetSlotIndex);
        broadcastState(io, state);
      } catch (err: any) {
        socket.emit("error-msg", err.message);
      }
    });

    socket.on("get-cards", () => {
      socket.emit("cards-catalog", {
        defense: DEFENSE_CARDS,
        attack: ATTACK_CARDS,
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

async function startGame(
  io: Server,
  p1Id: string, p1Name: string,
  p2Id: string, p2Name: string,
  p1SocketId: string, p2SocketId: string, 
  gameEngine: GameEngineService,
  gameSessionService: IGameSessionService
) {
  const state = gameEngine.createGame(p1Id, p1Name, p2Id, p2Name);
  gameSessionService.createSession(state);
  gameSessionService.mapPlayerToGame(p1Id, state.gameId);
  gameSessionService.mapPlayerToGame(p2Id, state.gameId);

  try {
    await Game.create({
      gameId: state.gameId,
      playerIds: [p1Id, p2Id],
      phase: "setup",
    });
  } catch {}

  const p1Socket = Array.from(io.sockets.sockets.values()).find(s => (s as any).userId === p1Id);
  const p2Socket = Array.from(io.sockets.sockets.values()).find(s => (s as any).userId === p2Id);
  
  if (p1Socket) p1Socket.join(state.gameId);
  if (p2Socket) p2Socket.join(state.gameId);

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

function startTickLoop(io: Server, gameId: string, gameEngine: GameEngineService, gameSessionService: IGameSessionService) {
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

function broadcastState(io: Server, state: GameState) {
  io.to(state.gameId).emit("game-state", state);
}

async function cleanupGame(gameId: string, gameSessionService: IGameSessionService) {
  const state = gameSessionService.getSession(gameId);
  if (!state) return;

  try {
    await Game.findOneAndUpdate({ gameId }, {
      phase: "finished",
      winnerId: state.winnerId,
      stateSnapshot: JSON.stringify(state),
      endedAt: new Date(),
    });

    if (state.winnerId) {
      console.log(`[Game] Recording win for ${state.winnerId}`);
      await User.findByIdAndUpdate(state.winnerId, { $inc: { wins: 1 } });
      const loserId = state.players.find(p => p.userId !== state.winnerId)?.userId;
      if (loserId) {
        console.log(`[Game] Recording loss for ${loserId}`);
        await User.findByIdAndUpdate(loserId, { $inc: { losses: 1 } });
      }
    }
  } catch (err) {
    console.error("[DB] Failed to persist game result:", err);
  }

  setTimeout(() => {
    for (const p of state.players) {
      gameSessionService.unmapPlayer(p.userId);
    }
    gameSessionService.removeSession(gameId);
  }, 5000);
}
