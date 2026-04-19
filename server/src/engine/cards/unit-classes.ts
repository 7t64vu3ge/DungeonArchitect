import { Card, CardType, UnitStats } from "../../types/domain";

export abstract class BaseUnit implements Card {
  public imageUrl: string;

  constructor(
    public id: number,
    public name: string,
    public type: CardType,
    public cost: number,
    public description?: string,
    public unitStats?: UnitStats,
    public subType?: "defense" | "attack",
    imageUrl?: string
  ) {
    this.imageUrl = imageUrl || this.getDefaultPlaceholder();
  }

  private getDefaultPlaceholder(): string {
    if (this instanceof Wall) {
      return "/assets/cards/placeholders/wall.png";
    }
    if (this.subType === "attack") {
      return "/assets/cards/placeholders/attack.png";
    }
    return "/assets/cards/placeholders/trap.png";
  }

  // Common behavior can be added here
  public takeDamage(amount: number): void {
    if (this.unitStats) {
      this.unitStats.hp -= amount;
      if (this.unitStats.hp < 0) this.unitStats.hp = 0;
    }
  }

  public isAlive(): boolean {
    return (this.unitStats?.hp ?? 0) > 0;
  }
}

export class Wall extends BaseUnit {
  constructor(
    id: number,
    name: string,
    cost: number,
    description: string,
    unitStats: UnitStats
  ) {
    super(id, name, "room", cost, description, unitStats, "defense");
  }

  // Walls have a specific blocking behavior
  public blocksMovement(): boolean {
    return this.isAlive();
  }
}

export class Attacker extends BaseUnit {
  constructor(
    id: number,
    name: string,
    cost: number,
    description: string,
    unitStats: UnitStats
  ) {
    super(id, name, "monster", cost, description, unitStats, "attack");
  }
}

export class Defender extends BaseUnit {
  constructor(
    id: number,
    name: string,
    type: CardType,
    cost: number,
    description: string,
    unitStats: UnitStats
  ) {
    super(id, name, type, cost, description, unitStats, "defense");
  }
}
