import { GameState } from "../../types/domain";
import { getCardById } from "../cards/unit-registry";

export interface ICombatSystem {
  process(state: GameState, now: number): void;
}

export class CombatSystem implements ICombatSystem {
  process(state: GameState, now: number): void {
    if (state.phase !== "battle") return;

    this.processAttackers(state, now);
    this.processDefenses(state, now);
    this.cleanupDeadUnits(state);
  }

  private processAttackers(state: GameState, now: number): void {
    for (let pi = 0; pi < 2; pi++) {
      const attackerPlayer = state.players[pi];
      const defenderPlayer = state.players[1 - pi];

      attackerPlayer.attackers = attackerPlayer.attackers.filter(a => a.currentHp > 0);

      for (const atk of attackerPlayer.attackers) {
        const card = getCardById(atk.cardId);
        if (!card || !card.unitStats) continue;

        const interval = (card.unitStats.attackSpeed ?? 2) * 1000;
        if (now - atk.lastAttackTime < interval) continue;

        atk.lastAttackTime = now;
        const damage = card.unitStats.damage ?? 0;
        if (damage <= 0) continue;

        const targetSlot = defenderPlayer.board[atk.targetSlotIndex];

        if (targetSlot && targetSlot.cardId !== null && targetSlot.currentHp > 0) {
          targetSlot.currentHp -= damage;
          if (targetSlot.currentHp <= 0) {
            const defCard = getCardById(targetSlot.cardId);
            state.logs.push({
              timestamp: now,
              message: `${defCard?.name} at slot ${atk.targetSlotIndex} was destroyed by ${card.name}!`,
            });
            targetSlot.currentHp = 0;
            targetSlot.cardId = null;
          }
        } else if (targetSlot && targetSlot.index === defenderPlayer.castleSlotIndex) {
          defenderPlayer.castleHp -= damage;
          if (defenderPlayer.castleHp <= 0) {
            defenderPlayer.castleHp = 0;
            state.phase = "finished";
            state.winnerId = attackerPlayer.userId;
            state.logs.push({
              timestamp: now,
              message: `${attackerPlayer.username} destroyed ${defenderPlayer.username}'s castle! GG!`,
            });
            return; 
          }
        }
      }
    }
  }

  private processDefenses(state: GameState, now: number): void {
    if (state.phase !== "battle") return;

    for (let pi = 0; pi < 2; pi++) {
      const defenderPlayer = state.players[pi];
      const attackerPlayer = state.players[1 - pi];

      for (const slot of defenderPlayer.board) {
        if (slot.cardId === null || slot.currentHp <= 0) continue;

        const defCard = getCardById(slot.cardId);
        if (!defCard || !defCard.unitStats) continue;

        const damage = defCard.unitStats.damage ?? 0;
        if (damage <= 0) continue; 

        const interval = (defCard.unitStats.attackSpeed ?? 2) * 1000;
        if (now - slot.lastAttackTime < interval) continue;
        slot.lastAttackTime = now;

        const targetAtk = attackerPlayer.attackers.find(
          a => a.targetSlotIndex === slot.index && a.currentHp > 0
        ) || attackerPlayer.attackers.find(a => a.currentHp > 0);

        if (targetAtk) {
          targetAtk.currentHp -= damage;
          if (targetAtk.currentHp <= 0) {
            const atkCard = getCardById(targetAtk.cardId);
            state.logs.push({
              timestamp: now,
              message: `${defCard.name} destroyed ${atkCard?.name}!`,
            });
          }
        }
      }
    }
  }

  private cleanupDeadUnits(state: GameState): void {
    for (const player of state.players) {
      player.attackers = player.attackers.filter(a => a.currentHp > 0);
    }
  }
}
