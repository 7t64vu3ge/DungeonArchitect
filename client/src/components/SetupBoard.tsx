import { useState } from "react";
import { BoardSlot, Card } from "../types/game";

interface SetupBoardProps {
  board: BoardSlot[];
  castleSlotIndex: number | null;
  defenseCards: Card[];
  onPlaceDefense: (slotIndex: number, cardId: number) => void;
  onPlaceCastle: (slotIndex: number) => void;
  isReady: boolean;
}

export default function SetupBoard({ board, castleSlotIndex, defenseCards, onPlaceDefense, onPlaceCastle, isReady }: SetupBoardProps) {
  const [selectedCard, setSelectedCard] = useState<Card | "castle" | null>(null);

  const handleSlotClick = (slotIndex: number) => {
    if (isReady || !selectedCard) return;
    if (selectedCard === "castle") {
      onPlaceCastle(slotIndex);
    } else {
      onPlaceDefense(slotIndex, selectedCard.id);
    }
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

      <div className="board-grid">
        {board.map((slot, i) => {
          const card = getCardForSlot(slot);
          const hpPct = getHpPercent(slot);
          return (
            <div
              key={i}
              className={`board-slot ${card ? "filled" : ""} ${i === castleSlotIndex ? "castle-slot" : ""}`}
              onClick={() => handleSlotClick(i)}
              title={card ? `${card.name} — HP: ${slot.currentHp}/${slot.maxHp}` : `Slot ${i} — Click to place`}
            >
              {i === castleSlotIndex && !card && (
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Castle</span>
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
                    style={{ opacity: 0.5, width: "85px", height: "85px", objectFit: "contain" }} 
                  />
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", position: "absolute", bottom: "8px" }}>
                    {selectedCard === "castle" ? "Place Castle" : (selectedCard ? "Click to place" : "Empty")}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>


      {!isReady && (
        <>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Select a defense card, then click a slot to place it (You MUST place your Castle!):
          </p>
          <div className="card-picker">
            <div
              className={`game-card ${selectedCard === "castle" ? "selected" : ""}`}
              onClick={() => setSelectedCard("castle")}
            >
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", height: "64px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "6px" }}>Castle</div>
              <div className="card-name">Your Castle</div>
              <div className="card-cost">Free</div>
              <div className="card-stats">Place this first!</div>
            </div>
            {defenseCards.map(card => (
              <div
                key={card.id}
                className={`game-card ${typeof selectedCard === "object" && selectedCard?.id === card.id ? "selected" : ""}`}
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
