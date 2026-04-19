import { Card } from "../../types/domain";
import { Wall, Attacker, Defender } from "./unit-classes";

export const UNIT_REGISTRY: Card[] = [
  // Defense Units
  new Wall(
    1,
    "Wooden Barricade",
    1,
    "Blocks movement paths cheaply.",
    {
      hp: 350,
      ability: "Blocks movement paths cheaply.",
      disability: "Weak against siege attacks.",
      distractedBy: "None"
    }
  ),
  new Defender(
    2,
    "Arrow Tower",
    "trap",
    2,
    "Reliable single-target ranged defence.",
    {
      hp: 300,
      damage: 35,
      range: 7,
      attackSpeed: 1.5,
      favoriteTarget: "Any",
      ability: "Reliable single-target ranged defence.",
      disability: "Weak against armored units.",
      distractedBy: "Closest enemy entering range."
    }
  ),
  new Wall(
    3,
    "Stone Wall",
    3,
    "Expensive and static wall with 40% ram resistance.",
    {
      hp: 750,
      favoriteTarget: "None",
      ability: "40% ram resistance.",
      disability: "Expensive and static.",
      distractedBy: "None"
    }
  ),
  new Defender(
    4,
    "Cannon Tower",
    "trap",
    4,
    "Anti-siege tower with slow reload.",
    {
      hp: 450,
      damage: 90,
      range: 8,
      attackSpeed: 3,
      favoriteTarget: "Siege Units",
      ability: "+50% damage vs siege.",
      disability: "Slow reload.",
      distractedBy: "Retargets nearest siege target first."
    }
  ),
  new Defender(
    5,
    "Ballista Tower",
    "trap",
    5,
    "Piercing tower effective against line formations and flyers.",
    {
      hp: 650,
      damage: 120,
      range: 10,
      attackSpeed: 3.5,
      favoriteTarget: "Line formations / Flyers",
      ability: "Pierces 4 enemies.",
      disability: "Slow fire rate.",
      distractedBy: "First aligned target lane."
    }
  ),
  // Attacking Units
  new Attacker(
    6,
    "Knights",
    3,
    "Disciplined warriors that lock onto targets.",
    {
      hp: 180,
      damage: 35,
      spawnCount: 10,
      favoriteTarget: "Any",
      ability: "Locks onto first target until destroyed.",
      disability: "No specialization.",
      distractedBy: "Nothing after lock-on."
    }
  ),
  new Attacker(
    7,
    "Archers",
    2,
    "Fragile long-range attackers.",
    {
      hp: 90,
      damage: 40,
      range: 7,
      spawnCount: 8,
      favoriteTarget: "Any",
      ability: "Long-range attacks.",
      disability: "Fragile.",
      distractedBy: "Closer enemy troop entering range."
    }
  ),
  new Attacker(
    8,
    "Goblins",
    1,
    "Fast swarm pressure with low individual damage.",
    {
      hp: 120,
      damage: 18,
      spawnCount: 12,
      favoriteTarget: "Any",
      ability: "Fast swarm pressure.",
      disability: "Weak individual damage.",
      distractedBy: "Lowest HP nearby target."
    }
  ),
  new Attacker(
    9,
    "Medic",
    2,
    "Restores allied troop HP.",
    {
      hp: 160,
      damage: 0, // Heals instead
      spawnCount: 4,
      favoriteTarget: "Allied wounded units",
      ability: "Restores allied troop HP (Heal: 25).",
      disability: "No attack power.",
      distractedBy: "Lowest HP ally nearby."
    }
  ),
  new Attacker(
    10,
    "Battle Ram",
    4,
    "Siege engine that targets defenses and gates.",
    {
      hp: 900,
      damage: 180,
      spawnCount: 1,
      favoriteTarget: "Defences / Gates",
      ability: "Double damage to walls/gates.",
      disability: "Ignores troops unless blocked.",
      distractedBy: "Only blockers in path."
    }
  ),
  new Attacker(
    11,
    "Catapult",
    5,
    "Heavy splash damage against buildings.",
    {
      hp: 500,
      damage: 150,
      range: 12,
      spawnCount: 1,
      favoriteTarget: "Buildings",
      ability: "Splash damage, +50% damage to buildings.",
      disability: "Vulnerable in close combat.",
      distractedBy: "Largest building cluster."
    }
  ),
  new Attacker(
    12,
    "Dragon Rider",
    7,
    "Flying unit with continuous flame damage.",
    {
      hp: 1200,
      damage: 110, // per sec
      spawnCount: 1,
      favoriteTarget: "Any clustered target",
      ability: "Flies over walls.",
      disability: "Vulnerable to ballista towers.",
      distractedBy: "Largest enemy cluster."
    }
  ),
  new Attacker(
    13,
    "Titan Crusher",
    8,
    "Massive structure-destroying unit.",
    {
      hp: 2500,
      damage: 300,
      spawnCount: 1,
      favoriteTarget: "Buildings",
      ability: "Triple damage to structures.",
      disability: "Easily swarmed.",
      distractedBy: "Blocking units only."
    }
  ),
  new Defender(
    14,
    "Inferno Tower",
    "trap",
    5,
    "Deals increasing damage to a single target. Lethal against giants.",
    {
      hp: 1000,
      damage: 150,
      range: 6,
      attackSpeed: 0.1,
      favoriteTarget: "High HP units",
      ability: "Damage increases the longer it stays on target.",
      disability: "Single target only.",
      distractedBy: "Newest unit in range."
    },
    "/assets/cards/epic/inferno_tower.png"
  ),
  new Defender(
    15,
    "Mortar",
    "trap",
    4,
    "Slow-firing long-range splash damage tower. Vulnerable at close range.",
    {
      hp: 600,
      damage: 120,
      range: 11,
      attackSpeed: 5,
      favoriteTarget: "Ground swarms",
      ability: "Large splash radius.",
      disability: "Cannot hit targets closer than 4 units.",
      distractedBy: "Largest cluster in range."
    },
    "/assets/cards/rare/mortar.png"
  ),
  new Defender(
    16,
    "Tesla Coil",
    "trap",
    3,
    "Zaps multiple enemies at once with chain lightning.",
    {
      hp: 400,
      damage: 45,
      range: 5,
      attackSpeed: 2,
      favoriteTarget: "Multiple targets",
      ability: "Chain lightning hits up to 3 nearby enemies.",
      disability: "Low individual damage.",
      distractedBy: "Closest enemy."
    },
    "/assets/cards/rare/tesla_coil.png"
  ),
  new Defender(
    17,
    "Ice Tower",
    "trap",
    2,
    "Slows enemy movement and attack speed by 35%.",
    {
      hp: 350,
      damage: 15,
      range: 6,
      attackSpeed: 1.2,
      favoriteTarget: "Any",
      ability: "Slows movement and attack speed by 35%.",
      disability: "Very low damage.",
      distractedBy: "Closest enemy."
    },
    "/assets/cards/common/ice_tower.png"
  )
];
