import { useState, useRef, useEffect } from "react";
import { GameState, PlayerState, Card, BoardSlot } from "../types/game";
import BattleLog from "./battle/BattleLog";
import AttackPicker from "./battle/AttackPicker";

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


  const getAttackersForSlot = (slotIndex: number) =>
    myPlayer.attackers.filter(a => a.targetSlotIndex === slotIndex);


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
            className={`board-slot ${card ? "filled" : ""} ${i === player.castleSlotIndex ? "castle-slot" : ""}`}
            onClick={() => isOpponent && handleSlotClick(i)}
            style={isOpponent ? { cursor: selectedAttackCard ? "crosshair" : "default" } : {}}
            title={card ? `${card.name} — HP: ${slot.currentHp}/${slot.maxHp}` : `Empty slot ${i}`}
          >

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
                {i === player.castleSlotIndex ? (
                  <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Castle</span>
                ) : (
                  <img 
                    src="/assets/cards/card_holder.png" 
                    alt="Empty Slot" 
                    className="slot-image" 
                    style={{ opacity: 0.3, width: "85px", height: "85px", objectFit: "contain" }} 
                  />
                )}
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", position: "absolute", bottom: "8px" }}>
                  {i === player.castleSlotIndex ? "Castle" : (isOpponent && selectedAttackCard ? "Attack" : "Empty")}
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
      <div className="battle-arena">
        <div className="player-side">
          <div className="player-header">
            <div>
              <span className="player-name">{myPlayer.username} (You)</span>
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

        <div className="battle-divider">
          <div className="vs-badge">VS</div>
        </div>

        <div className="player-side">
          <div className="player-header">
            <div>
              <span className="player-name">{opponent.username}</span>
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
      <AttackPicker 
        attackCards={attackCards} 
        myPlayer={myPlayer} 
        selectedAttackCard={selectedAttackCard} 
        onSelectCallback={setSelectedAttackCard} 
      />

      <BattleLog logs={gameState.logs} />
    </div>
  );
}
