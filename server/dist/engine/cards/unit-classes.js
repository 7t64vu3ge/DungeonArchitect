"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Defender = exports.Attacker = exports.Wall = exports.BaseUnit = void 0;
class BaseUnit {
    constructor(id, name, type, cost, description = "", unitStats = { hp: 100 }, subType = "defense", imageUrl) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.description = description;
        this.unitStats = unitStats;
        this.subType = subType;
        this.imageUrl = imageUrl || this.getDefaultPlaceholder();
    }
    getDefaultPlaceholder() {
        if (this instanceof Wall)
            return "/assets/cards/placeholders/wall.png";
        if (this.subType === "attack")
            return "/assets/cards/placeholders/attack.png";
        return "/assets/cards/placeholders/trap.png";
    }
    getAttackInterval() {
        return (this.unitStats.attackSpeed ?? 2) * 1000;
    }
}
exports.BaseUnit = BaseUnit;
class Wall extends BaseUnit {
    constructor(id, name, cost, description, unitStats, imageUrl) {
        super(id, name, "room", cost, description, unitStats, "defense", imageUrl);
    }
    blocksMovement() {
        return (this.unitStats?.hp ?? 0) > 0;
    }
}
exports.Wall = Wall;
class Attacker extends BaseUnit {
    constructor(id, name, cost, description, unitStats, imageUrl) {
        super(id, name, "monster", cost, description, unitStats, "attack", imageUrl);
    }
}
exports.Attacker = Attacker;
class Defender extends BaseUnit {
    constructor(id, name, type, cost, description, unitStats, imageUrl) {
        super(id, name, type, cost, description, unitStats, "defense", imageUrl);
    }
}
exports.Defender = Defender;
//# sourceMappingURL=unit-classes.js.map