import { GameState } from "../../types/domain";
import { IManaSystem } from "./mana.system";
import { ICombatSystem } from "./combat.system";

export interface IGameTickOrchestrator {
  update(state: GameState): GameState;
}

export class GameTickOrchestrator implements IGameTickOrchestrator {
  constructor(
    private readonly manaSystem: IManaSystem,
    private readonly combatSystem: ICombatSystem
  ) {}

  public update(state: GameState): GameState {
    if (state.phase !== "battle") return state;

    const now = Date.now();
    const deltaMs = now - state.lastTickTime;
    state.lastTickTime = now;

    this.manaSystem.process(state, deltaMs);
    this.combatSystem.process(state, now);

    return state;
  }
}
