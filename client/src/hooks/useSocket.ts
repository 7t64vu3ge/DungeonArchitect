import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { GameState, Card } from "../types/game";

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [inQueue, setInQueue] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cardsCatalog, setCardsCatalog] = useState<{ defense: Card[]; attack: Card[] } | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io("/", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("get-cards");
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("game-state", (state: GameState) => {
      setGameState(state);
      setInQueue(false);
    });

    socket.on("queue-status", () => {
      setInQueue(true);
    });

    socket.on("cards-catalog", (catalog: { defense: Card[]; attack: Card[] }) => {
      setCardsCatalog(catalog);
    });

    socket.on("error-msg", (msg: string) => {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 3000);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const joinQueue = useCallback(() => {
    socketRef.current?.emit("join-queue");
  }, []);

  const leaveQueue = useCallback(() => {
    socketRef.current?.emit("leave-queue");
    setInQueue(false);
  }, []);

  const placeDefense = useCallback((slotIndex: number, cardId: number) => {
    socketRef.current?.emit("place-defense", { slotIndex, cardId });
  }, []);

  const placeCastle = useCallback((slotIndex: number) => {
    socketRef.current?.emit("place-castle", { slotIndex });
  }, []);

  const playerReady = useCallback(() => {
    socketRef.current?.emit("player-ready");
  }, []);

  const placeAttacker = useCallback((cardId: number, targetSlotIndex: number) => {
    socketRef.current?.emit("place-attacker", { cardId, targetSlotIndex });
  }, []);

  return {
    connected,
    gameState,
    inQueue,
    errorMsg,
    cardsCatalog,
    joinQueue,
    leaveQueue,
    placeDefense,
    placeCastle,
    playerReady,
    placeAttacker,
  };
}
