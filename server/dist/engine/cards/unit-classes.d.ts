import { Card, CardType, UnitStats } from "../../types/domain";
export declare abstract class BaseUnit implements Card {
    id: number;
    name: string;
    type: CardType;
    cost: number;
    description: string;
    unitStats: UnitStats;
    subType: "defense" | "attack";
    imageUrl: string;
    constructor(id: number, name: string, type: CardType, cost: number, description?: string, unitStats?: UnitStats, subType?: "defense" | "attack", imageUrl?: string);
    private getDefaultPlaceholder;
    getAttackInterval(): number;
}
export declare class Wall extends BaseUnit {
    constructor(id: number, name: string, cost: number, description: string, unitStats: UnitStats, imageUrl?: string);
    blocksMovement(): boolean;
}
export declare class Attacker extends BaseUnit {
    constructor(id: number, name: string, cost: number, description: string, unitStats: UnitStats, imageUrl?: string);
}
export declare class Defender extends BaseUnit {
    constructor(id: number, name: string, type: CardType, cost: number, description: string, unitStats: UnitStats, imageUrl?: string);
}
//# sourceMappingURL=unit-classes.d.ts.map