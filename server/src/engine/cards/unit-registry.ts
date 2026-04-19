import { Card } from "../../types/domain";

export const UNIT_REGISTRY: Card[] = [
  // Defense Units
  {
    id: 1,
    name: "Wooden Barricade",
    type: "room",
    subType: "defense",
    cost: 1,
    description: "Blocks movement paths cheaply.",
    unitStats: {
      hp: 350,
      ability: "Blocks movement paths cheaply.",
      disability: "Weak against siege attacks.",
      distractedBy: "None"
    }
  },
  {
    id: 2,
    name: "Arrow Tower",
    type: "trap",
    subType: "defense",
    cost: 2,
    description: "Reliable single-target ranged defence.",
    unitStats: {
      hp: 300,
      damage: 35,
      range: 7,
      attackSpeed: 1.5,
      favoriteTarget: "Any",
      ability: "Reliable single-target ranged defence.",
      disability: "Weak against armored units.",
      distractedBy: "Closest enemy entering range."
    }
  },
  {
    id: 3,
    name: "Stone Wall",
    type: "room",
    subType: "defense",
    cost: 3,
    description: "Expensive and static wall with 40% ram resistance.",
    unitStats: {
      hp: 750,
      favoriteTarget: "None",
      ability: "40% ram resistance.",
      disability: "Expensive and static.",
      distractedBy: "None"
    }
  },
  {
    id: 4,
    name: "Cannon Tower",
    type: "trap",
    subType: "defense",
    cost: 4,
    description: "Anti-siege tower with slow reload.",
    unitStats: {
      hp: 450,
      damage: 90,
      range: 8,
      attackSpeed: 3,
      favoriteTarget: "Siege Units",
      ability: "+50% damage vs siege.",
      disability: "Slow reload.",
      distractedBy: "Retargets nearest siege target first."
    }
  },
  {
    id: 5,
    name: "Ballista Tower",
    type: "trap",
    subType: "defense",
    cost: 5,
    description: "Piercing tower effective against line formations and flyers.",
    unitStats: {
      hp: 650,
      damage: 120,
      range: 10,
      attackSpeed: 3.5,
      favoriteTarget: "Line formations / Flyers",
      ability: "Pierces 4 enemies.",
      disability: "Slow fire rate.",
      distractedBy: "First aligned target lane."
    }
  },
  // Attacking Units
  {
    id: 6,
    name: "Knights",
    type: "monster",
    subType: "attack",
    cost: 3,
    description: "Disciplined warriors that lock onto targets.",
    unitStats: {
      hp: 180,
      damage: 35,
      spawnCount: 10,
      favoriteTarget: "Any",
      ability: "Locks onto first target until destroyed.",
      disability: "No specialization.",
      distractedBy: "Nothing after lock-on."
    }
  },
  {
    id: 7,
    name: "Archers",
    type: "monster",
    subType: "attack",
    cost: 2,
    description: "Fragile long-range attackers.",
    unitStats: {
      hp: 90,
      damage: 40,
      range: 7,
      spawnCount: 8,
      favoriteTarget: "Any",
      ability: "Long-range attacks.",
      disability: "Fragile.",
      distractedBy: "Closer enemy troop entering range."
    }
  },
  {
    id: 8,
    name: "Goblins",
    type: "monster",
    subType: "attack",
    cost: 1,
    description: "Fast swarm pressure with low individual damage.",
    unitStats: {
      hp: 120,
      damage: 18,
      spawnCount: 12,
      favoriteTarget: "Any",
      ability: "Fast swarm pressure.",
      disability: "Weak individual damage.",
      distractedBy: "Lowest HP nearby target."
    }
  },
  {
    id: 9,
    name: "Medic",
    type: "monster",
    subType: "attack",
    cost: 2,
    description: "Restores allied troop HP.",
    unitStats: {
      hp: 160,
      damage: 0, // Heals instead
      spawnCount: 4,
      favoriteTarget: "Allied wounded units",
      ability: "Restores allied troop HP (Heal: 25).",
      disability: "No attack power.",
      distractedBy: "Lowest HP ally nearby."
    }
  },
  {
    id: 10,
    name: "Battle Ram",
    type: "monster",
    subType: "attack",
    cost: 4,
    description: "Siege engine that targets defenses and gates.",
    unitStats: {
      hp: 900,
      damage: 180,
      spawnCount: 1,
      favoriteTarget: "Defences / Gates",
      ability: "Double damage to walls/gates.",
      disability: "Ignores troops unless blocked.",
      distractedBy: "Only blockers in path."
    }
  },
  {
    id: 11,
    name: "Catapult",
    type: "monster",
    subType: "attack",
    cost: 5,
    description: "Heavy splash damage against buildings.",
    unitStats: {
      hp: 500,
      damage: 150,
      range: 12,
      spawnCount: 1,
      favoriteTarget: "Buildings",
      ability: "Splash damage, +50% damage to buildings.",
      disability: "Vulnerable in close combat.",
      distractedBy: "Largest building cluster."
    }
  },
  {
    id: 12,
    name: "Dragon Rider",
    type: "monster",
    subType: "attack",
    cost: 7,
    description: "Flying unit with continuous flame damage.",
    unitStats: {
      hp: 1200,
      damage: 110, // per sec
      spawnCount: 1,
      favoriteTarget: "Any clustered target",
      ability: "Flies over walls.",
      disability: "Vulnerable to ballista towers.",
      distractedBy: "Largest enemy cluster."
    }
  },
  {
    id: 13,
    name: "Titan Crusher",
    type: "monster",
    subType: "attack",
    cost: 8,
    description: "Massive structure-destroying unit.",
    unitStats: {
      hp: 2500,
      damage: 300,
      spawnCount: 1,
      favoriteTarget: "Buildings",
      ability: "Triple damage to structures.",
      disability: "Easily swarmed.",
      distractedBy: "Blocking units only."
    }
  }
];
