import { GameState } from "../../types/domain";
export declare class GameEngine {
    static createGame(p1Id: string, p1Name: string, p2Id: string, p2Name: string): GameState;
    static placeDefense(state: GameState, userId: string, slotIndex: number, cardId: number): GameState;
    static setPlayerReady(state: GameState, userId: string): GameState;
    static startBattle(state: GameState): GameState;
    static placeAttacker(state: GameState, userId: string, cardId: number, targetSlotIndex: number): GameState;
    static tick(state: GameState): GameState;
    static isFinished(state: GameState): boolean;
    static getDefenseCards(): import("../../types/domain").Card[];
    static getAttackCards(): import("../../types/domain").Card[];
}
//# sourceMappingURL=game-engine.d.ts.map