import { useState, useEffect, useMemo } from "react";
import { GameState, Card } from "../types/game";
import SetupBoard from "../components/SetupBoard";
import BattleArena from "../components/BattleArena";

interface GamePageProps {
  gameState: GameState;
  userId: string;
  cardsCatalog: { defense: Card[]; attack: Card[] } | null;
  onPlaceDefense: (slotIndex: number, cardId: number) => void;
  onPlayerReady: () => void;
  onPlaceAttacker: (cardId: number, targetSlotIndex: number) => void;
  onBackToLobby: () => void;
}

export default function GamePage({
  gameState, userId, cardsCatalog,
  onPlaceDefense, onPlayerReady, onPlaceAttacker, onBackToLobby,
}: GamePageProps) {
  const [timeLeft, setTimeLeft] = useState(30);

  const myPlayer = useMemo(
    () => gameState.players.find(p => p.userId === userId),
    [gameState, userId]
  );
  const opponent = useMemo(
    () => gameState.players.find(p => p.userId !== userId),
    [gameState, userId]
  );

  // Setup countdown timer
  useEffect(() => {
    if (gameState.phase !== "setup") return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((gameState.setupDeadline - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 200);
    return () => clearInterval(interval);
  }, [gameState.phase, gameState.setupDeadline]);

  if (!myPlayer || !opponent) {
    return <div className="page-center"><p>Loading game...</p></div>;
  }

  // ── FINISHED ─────────────────────────────────
  if (gameState.phase === "finished") {
    const isWinner = gameState.winnerId === userId;
    return (
      <div className="winner-overlay">
        <div className="winner-text">
          {isWinner ? "🏆 VICTORY!" : "💀 DEFEAT"}
        </div>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: "1.1rem" }}>
          {isWinner
            ? `You destroyed ${opponent.username}'s castle!`
            : `${opponent.username} destroyed your castle!`}
        </p>
        <button className="btn btn-gold" onClick={onBackToLobby}>
          Back to Lobby
        </button>
      </div>
    );
  }

  // ── SETUP PHASE ──────────────────────────────
  if (gameState.phase === "setup") {
    return (
      <div className="page-center game-background" style={{ gap: 20 }}>
        <h2 style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
          ⚒️ Setup Phase
        </h2>
        <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>
          Place defenses on your board • You vs <strong>{opponent.username}</strong>
        </p>

        <div className={`timer-display ${timeLeft <= 10 ? "urgent" : ""}`}>
          {timeLeft}s
        </div>

        <SetupBoard
          board={myPlayer.board}
          defenseCards={cardsCatalog?.defense ?? []}
          onPlaceDefense={onPlaceDefense}
          isReady={myPlayer.isReady}
        />

        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="btn btn-gold"
            onClick={onPlayerReady}
            disabled={myPlayer.isReady}
          >
            {myPlayer.isReady ? "Waiting for opponent..." : "✅ Ready!"}
          </button>
        </div>

        {opponent.isReady && (
          <p style={{ color: "var(--accent-green)", fontSize: "0.9rem" }}>
            {opponent.username} is ready!
          </p>
        )}
      </div>
    );
  }

  // ── BATTLE PHASE ─────────────────────────────
  return (
    <div className="game-background" style={{ padding: 16 }}>
      <BattleArena
        gameState={gameState}
        userId={userId}
        myPlayer={myPlayer}
        opponent={opponent}
        attackCards={cardsCatalog?.attack ?? []}
        defenseCards={cardsCatalog?.defense ?? []}
        onPlaceAttacker={onPlaceAttacker}
      />
    </div>
  );
}
