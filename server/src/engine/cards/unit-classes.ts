import { Card, CardType, UnitStats } from "../../types/domain";

export abstract class BaseUnit implements Card {
  public imageUrl: string;

  constructor(
    public id: number,
    public name: string,
    public type: CardType,
    public cost: number,
    public description: string = "",
    public unitStats: UnitStats = { hp: 100 },
    public subType: "defense" | "attack" = "defense",
    imageUrl?: string
  ) {
    this.imageUrl = imageUrl || this.getDefaultPlaceholder();
  }

  private getDefaultPlaceholder(): string {
    if (this instanceof Wall) return "/assets/cards/placeholders/wall.png";
    if (this.subType === "attack") return "/assets/cards/placeholders/attack.png";
    return "/assets/cards/placeholders/trap.png";
  }

  public getAttackInterval(): number {
    return (this.unitStats.attackSpeed ?? 2) * 1000;
  }
}

export class Wall extends BaseUnit {
  constructor(id: number, name: string, cost: number, description: string, unitStats: UnitStats, imageUrl?: string) {
    super(id, name, "room", cost, description, unitStats, "defense", imageUrl);
  }
  public blocksMovement(): boolean {
    return (this.unitStats?.hp ?? 0) > 0;
  }
}

export class Attacker extends BaseUnit {
  constructor(id: number, name: string, cost: number, description: string, unitStats: UnitStats, imageUrl?: string) {
    super(id, name, "monster", cost, description, unitStats, "attack", imageUrl);
  }
}

export class Defender extends BaseUnit {
  constructor(id: number, name: string, type: CardType, cost: number, description: string, unitStats: UnitStats, imageUrl?: string) {
    super(id, name, type, cost, description, unitStats, "defense", imageUrl);
  }
}
