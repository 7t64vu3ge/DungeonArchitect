import { GameState } from "../../types/domain";
import { IGameTickOrchestrator } from "../systems/game-tick.orchestrator";
export declare class GameEngineService {
    private readonly tickOrchestrator;
    constructor(tickOrchestrator: IGameTickOrchestrator);
    createGame(p1Id: string, p1Name: string, p2Id: string, p2Name: string): GameState;
    placeDefense(state: GameState, userId: string, slotIndex: number, cardId: number): GameState;
    setPlayerReady(state: GameState, userId: string): GameState;
    placeCastle(state: GameState, userId: string, slotIndex: number): GameState;
    startBattle(state: GameState): GameState;
    placeAttacker(state: GameState, userId: string, cardId: number, targetSlotIndex: number): GameState;
    tick(state: GameState): GameState;
    isFinished(state: GameState): boolean;
    getDefenseCards(): import("../../types/domain").Card[];
    getAttackCards(): import("../../types/domain").Card[];
}
//# sourceMappingURL=game-engine.d.ts.map