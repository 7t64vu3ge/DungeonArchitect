import { useState, useRef, useEffect } from "react";
import { GameState, PlayerState, Card, BoardSlot } from "../types/game";

interface BattleArenaProps {
  gameState: GameState;
  userId: string;
  myPlayer: PlayerState;
  opponent: PlayerState;
  attackCards: Card[];
  defenseCards: Card[];
  onPlaceAttacker: (cardId: number, targetSlotIndex: number) => void;
}

export default function BattleArena({
  gameState, userId, myPlayer, opponent, attackCards, defenseCards,
  onPlaceAttacker,
}: BattleArenaProps) {
  const [selectedAttackCard, setSelectedAttackCard] = useState<Card | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [gameState.logs]);

  const allCards = [...attackCards, ...defenseCards];
  const getCard = (id: number | null): Card | undefined =>
    id !== null ? allCards.find(c => c.id === id) : undefined;

  const hpPercent = (current: number, max: number) =>
    max > 0 ? Math.max(0, (current / max) * 100) : 0;

  const hpClass = (pct: number) =>
    pct > 60 ? "hp-high" : pct > 30 ? "hp-mid" : "hp-low";

  const handleSlotClick = (slotIndex: number) => {
    if (!selectedAttackCard) return;
    if (myPlayer.mana < selectedAttackCard.cost) return;
    onPlaceAttacker(selectedAttackCard.id, slotIndex);
  };

  // Get attackers targeting a specific slot on the opponent's board
  const getAttackersForSlot = (slotIndex: number) =>
    myPlayer.attackers.filter(a => a.targetSlotIndex === slotIndex);

  // Get opponent's attackers targeting my board
  const getEnemyAttackersForSlot = (slotIndex: number) =>
    opponent.attackers.filter(a => a.targetSlotIndex === slotIndex);

  const renderBoard = (player: PlayerState, isOpponent: boolean) => (
    <div className="board-grid">
      {player.board.map((slot, i) => {
        const card = getCard(slot.cardId);
        const pct = hpPercent(slot.currentHp, slot.maxHp);
        const attackersHere = isOpponent
          ? getAttackersForSlot(i)
          : getEnemyAttackersForSlot(i);

        return (
          <div
            key={i}
            className={`board-slot ${card ? "filled" : ""}`}
            onClick={() => isOpponent && handleSlotClick(i)}
            style={isOpponent ? { cursor: selectedAttackCard ? "crosshair" : "default" } : {}}
            title={card ? `${card.name} — HP: ${slot.currentHp}/${slot.maxHp}` : `Empty slot ${i}`}
          >
            {/* Attacker icons */}
            {attackersHere.length > 0 && (
              <div className="attackers-on-slot">
                {attackersHere.map(atk => {
                  const ac = getCard(atk.cardId);
                  return (
                    <img
                      key={atk.uid}
                      className="attacker-icon"
                      src={ac?.imageUrl || "/assets/cards/placeholders/attack.png"}
                      alt={ac?.name}
                      title={`${ac?.name} HP: ${atk.currentHp}/${atk.maxHp}`}
                      onError={e => { (e.target as HTMLImageElement).src = "/assets/cards/placeholders/attack.png"; }}
                    />
                  );
                })}
              </div>
            )}

            {card ? (
              <>
                <img
                  className="slot-image"
                  src={card.imageUrl || "/assets/cards/placeholders/trap.png"}
                  alt={card.name}
                  onError={e => { (e.target as HTMLImageElement).src = "/assets/cards/placeholders/trap.png"; }}
                />
                <span className="slot-name">{card.name}</span>
                <div className="slot-hp">
                  <div className="hp-bar-container">
                    <div className={`hp-bar-fill ${hpClass(pct)}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <img 
                  src="/assets/cards/card_holder.png" 
                  alt="Empty Slot" 
                  className="slot-image" 
                  style={{ opacity: 0.3, width: "64px", height: "64px" }} 
                />
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", position: "absolute", bottom: "8px" }}>
                  {isOpponent && selectedAttackCard ? "⚔ Attack here" : "Empty"}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  const castleHpPct = (p: PlayerState) => hpPercent(p.castleHp, p.maxCastleHp);
  const manaPct = (p: PlayerState) => hpPercent(p.mana, p.maxMana);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
      {/* Battle Arena */}
      <div className="battle-arena">
        {/* My Side */}
        <div className="player-side">
          <div className="player-header">
            <div>
              <span className="player-name">🛡️ {myPlayer.username} (You)</span>
            </div>
            <div className="castle-hp">
              Castle: <span className="hp-value">{Math.floor(myPlayer.castleHp)}</span>
            </div>
          </div>
          <div className="hp-bar-container" style={{ height: 10 }}>
            <div className={`hp-bar-fill ${hpClass(castleHpPct(myPlayer))}`}
              style={{ width: `${castleHpPct(myPlayer)}%` }} />
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--accent-blue)" }}>
            Mana: {Math.floor(myPlayer.mana)}/{myPlayer.maxMana}
          </div>
          <div className="mana-bar-container">
            <div className="mana-bar-fill" style={{ width: `${manaPct(myPlayer)}%` }} />
          </div>
          {renderBoard(myPlayer, false)}
        </div>

        {/* Divider */}
        <div className="battle-divider">
          <div className="vs-badge">VS</div>
        </div>

        {/* Opponent Side */}
        <div className="player-side">
          <div className="player-header">
            <div>
              <span className="player-name">⚔️ {opponent.username}</span>
            </div>
            <div className="castle-hp">
              Castle: <span className="hp-value">{Math.floor(opponent.castleHp)}</span>
            </div>
          </div>
          <div className="hp-bar-container" style={{ height: 10 }}>
            <div className={`hp-bar-fill ${hpClass(castleHpPct(opponent))}`}
              style={{ width: `${castleHpPct(opponent)}%` }} />
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Click a slot on your opponent's board to deploy an attacker
          </p>
          {renderBoard(opponent, true)}
        </div>
      </div>

      {/* Attack Card Picker */}
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 8 }}>
          Select an attack card, then click on opponent's board to deploy:
        </p>
        <div className="card-picker">
          {attackCards.map(card => {
            const canAfford = myPlayer.mana >= card.cost;
            return (
              <div
                key={card.id}
                className={`game-card ${selectedAttackCard?.id === card.id ? "selected" : ""}`}
                onClick={() => canAfford && setSelectedAttackCard(card)}
                style={{ opacity: canAfford ? 1 : 0.4 }}
              >
                <img
                  src={card.imageUrl || "/assets/cards/placeholders/attack.png"}
                  alt={card.name}
                  onError={e => { (e.target as HTMLImageElement).src = "/assets/cards/placeholders/attack.png"; }}
                />
                <div className="card-name">{card.name}</div>
                <div className="card-cost">⚡ {card.cost} mana</div>
                <div className="card-stats">
                  HP: {card.unitStats?.hp ?? "?"} | DMG: {card.unitStats?.damage ?? 0}
                </div>
                <div className="card-stats">
                  Speed: {card.unitStats?.attackSpeed ?? "?"}s
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Game Log */}
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <h3 style={{ fontSize: "0.9rem", marginBottom: 8, color: "var(--text-secondary)" }}>
          📜 Battle Log
        </h3>
        <div className="game-log" ref={logRef}>
          {gameState.logs.slice(-30).map((log, i) => (
            <div key={i} className="log-entry">{log.message}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
