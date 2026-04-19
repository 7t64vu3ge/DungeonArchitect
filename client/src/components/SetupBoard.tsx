import { useState } from "react";
import { BoardSlot, Card } from "../types/game";

interface SetupBoardProps {
  board: BoardSlot[];
  defenseCards: Card[];
  onPlaceDefense: (slotIndex: number, cardId: number) => void;
  isReady: boolean;
}

export default function SetupBoard({ board, defenseCards, onPlaceDefense, isReady }: SetupBoardProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const handleSlotClick = (slotIndex: number) => {
    if (isReady || !selectedCard) return;
    onPlaceDefense(slotIndex, selectedCard.id);
  };

  const getCardForSlot = (slot: BoardSlot): Card | undefined => {
    if (slot.cardId === null) return undefined;
    return defenseCards.find(c => c.id === slot.cardId);
  };

  const getHpPercent = (slot: BoardSlot) => {
    if (slot.maxHp === 0) return 0;
    return Math.max(0, (slot.currentHp / slot.maxHp) * 100);
  };

  const getHpClass = (pct: number) => {
    if (pct > 60) return "hp-high";
    if (pct > 30) return "hp-mid";
    return "hp-low";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", maxWidth: 600 }}>
      {/* Board Grid */}
      <div className="board-grid">
        {board.map((slot, i) => {
          const card = getCardForSlot(slot);
          const hpPct = getHpPercent(slot);
          return (
            <div
              key={i}
              className={`board-slot ${card ? "filled" : ""} ${i === 0 ? "castle-slot" : ""}`}
              onClick={() => handleSlotClick(i)}
              title={card ? `${card.name} — HP: ${slot.currentHp}/${slot.maxHp}` : `Slot ${i} — Click to place`}
            >
              {i === 0 && !card && (
                <span style={{ fontSize: "1.5rem" }}>🏰</span>
              )}
              {card && (
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
                      <div
                        className={`hp-bar-fill ${getHpClass(hpPct)}`}
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
              {!card && i !== 0 && (
                <>
                  <img 
                    src="/assets/cards/card_holder.png" 
                    alt="Empty Slot" 
                    className="slot-image" 
                    style={{ opacity: 0.5, width: "64px", height: "64px" }} 
                  />
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", position: "absolute", bottom: "8px" }}>
                    {selectedCard ? "Click to place" : "Empty"}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Card Picker */}
      {!isReady && (
        <>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Select a defense card, then click a slot to place it:
          </p>
          <div className="card-picker">
            {defenseCards.map(card => (
              <div
                key={card.id}
                className={`game-card ${selectedCard?.id === card.id ? "selected" : ""}`}
                onClick={() => setSelectedCard(card)}
              >
                <img
                  src={card.imageUrl || "/assets/cards/placeholders/trap.png"}
                  alt={card.name}
                  onError={e => { (e.target as HTMLImageElement).src = "/assets/cards/placeholders/trap.png"; }}
                />
                <div className="card-name">{card.name}</div>
                <div className="card-cost">Cost: {card.cost}</div>
                <div className="card-stats">
                  HP: {card.unitStats?.hp ?? "?"} | DMG: {card.unitStats?.damage ?? 0}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
