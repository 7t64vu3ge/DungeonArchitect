import { GameState } from "../../types/domain";

export interface IManaSystem {
  process(state: GameState, deltaMs: number): void;
}

export class ManaSystem implements IManaSystem {
  private readonly regenIntervalMs = 1000;

  process(state: GameState, deltaMs: number): void {
    if (state.phase !== "battle") return;

    for (const player of state.players) {
      const manaGain = deltaMs / this.regenIntervalMs;
      player.mana = Math.min(player.maxMana, player.mana + manaGain);
    }
  }
}
