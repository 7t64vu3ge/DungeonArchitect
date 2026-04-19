import { Card, PlayerState } from "../../types/game";

interface AttackPickerProps {
  attackCards: Card[];
  myPlayer: PlayerState;
  selectedAttackCard: Card | null;
  onSelectCallback: (card: Card) => void;
}

export default function AttackPicker({ attackCards, myPlayer, selectedAttackCard, onSelectCallback }: AttackPickerProps) {
  return (
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
              onClick={() => canAfford && onSelectCallback(card)}
              style={{ opacity: canAfford ? 1 : 0.4 }}
            >
              <img
                src={card.imageUrl || "/assets/cards/placeholders/attack.png"}
                alt={card.name}
                onError={e => { (e.target as HTMLImageElement).src = "/assets/cards/placeholders/attack.png"; }}
              />
              <div className="card-name">{card.name}</div>
              <div className="card-cost">Energy: {card.cost}</div>
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
  );
}
