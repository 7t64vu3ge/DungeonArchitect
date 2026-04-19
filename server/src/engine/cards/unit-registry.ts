import { Card } from "../../types/domain";
import { Wall, Attacker, Defender } from "./unit-classes";

// ── All cards in the game ───────────────────
// Sprite mapping:
//   common: archer, goblin, knight, medic, spearmen, ice_tower
//   rare: battleram, cavalryrider, firethrower, shieldguard, mortar, tesla_coil
//   epic: assassins, catapult, warelephant, inferno_tower
//   placeholders: wall, attack, trap

const ALL_CARDS: Card[] = [
  // ═══════════════════════════════════════════
  // DEFENSE CARDS
  // ═══════════════════════════════════════════
  new Wall(1, "Wooden Barricade", 1, "Blocks movement paths cheaply.", {
    hp: 350, damage: 0, attackSpeed: 0,
    ability: "Blocks movement.", disability: "Weak vs siege.", distractedBy: "None"
  }, "/assets/cards/placeholders/wall.png"),

  new Defender(2, "Arrow Tower", "trap", 2, "Reliable single-target ranged defence.", {
    hp: 300, damage: 35, range: 7, attackSpeed: 1.5, favoriteTarget: "Any",
    ability: "Single-target ranged.", disability: "Weak vs armored.", distractedBy: "Closest enemy."
  }, "/assets/cards/placeholders/trap.png"),

  new Wall(3, "Stone Wall", 3, "High-HP wall with ram resistance.", {
    hp: 750, damage: 0, attackSpeed: 0,
    ability: "40% ram resistance.", disability: "Expensive.", distractedBy: "None"
  }, "/assets/cards/placeholders/wall.png"),

  new Defender(4, "Cannon Tower", "trap", 4, "Anti-siege tower.", {
    hp: 450, damage: 90, range: 8, attackSpeed: 3, favoriteTarget: "Siege",
    ability: "+50% vs siege.", disability: "Slow reload.", distractedBy: "Nearest siege."
  }, "/assets/cards/placeholders/trap.png"),

  new Defender(5, "Ballista Tower", "trap", 5, "Piercing tower.", {
    hp: 650, damage: 120, range: 10, attackSpeed: 3.5, favoriteTarget: "Line/Flyers",
    ability: "Pierces 4 enemies.", disability: "Slow fire rate.", distractedBy: "First lane."
  }, "/assets/cards/placeholders/trap.png"),

  new Defender(14, "Inferno Tower", "trap", 5, "Increasing damage single target.", {
    hp: 1000, damage: 50, range: 6, attackSpeed: 1.0, favoriteTarget: "High HP",
    ability: "Damage increases over time.", disability: "Single target.", distractedBy: "Newest unit."
  }, "/assets/cards/epic/inferno_tower.png"),

  new Defender(15, "Mortar", "trap", 4, "Long-range splash damage.", {
    hp: 600, damage: 120, range: 11, attackSpeed: 5, favoriteTarget: "Swarms",
    ability: "Large splash radius.", disability: "Blind spot at close range.", distractedBy: "Largest cluster."
  }, "/assets/cards/rare/mortar.png"),

  new Defender(16, "Tesla Coil", "trap", 3, "Chain lightning.", {
    hp: 400, damage: 45, range: 5, attackSpeed: 2, favoriteTarget: "Multiple",
    ability: "Chains to 3 enemies.", disability: "Low damage.", distractedBy: "Closest."
  }, "/assets/cards/rare/tesla_coil.png"),

  new Defender(17, "Ice Tower", "trap", 2, "Slows enemies.", {
    hp: 350, damage: 15, range: 6, attackSpeed: 1.2, favoriteTarget: "Any",
    ability: "Slows 35%.", disability: "Very low damage.", distractedBy: "Closest."
  }, "/assets/cards/common/ice_tower.png"),

  // ═══════════════════════════════════════════
  // ATTACK CARDS
  // ═══════════════════════════════════════════
  new Attacker(6, "Knights", 3, "Disciplined melee warriors.", {
    hp: 180, damage: 35, attackSpeed: 1.5, spawnCount: 1, favoriteTarget: "Any",
    ability: "Lock-on.", disability: "No specialization.", distractedBy: "Nothing."
  }, "/assets/cards/common/knight.png"),

  new Attacker(7, "Archers", 2, "Fragile ranged attackers.", {
    hp: 90, damage: 40, range: 7, attackSpeed: 1.8, spawnCount: 1, favoriteTarget: "Any",
    ability: "Long-range.", disability: "Fragile.", distractedBy: "Closer enemy."
  }, "/assets/cards/common/archer.png"),

  new Attacker(8, "Goblins", 1, "Fast cheap swarm.", {
    hp: 120, damage: 18, attackSpeed: 0.8, spawnCount: 1, favoriteTarget: "Any",
    ability: "Fast swarm.", disability: "Weak damage.", distractedBy: "Low HP."
  }, "/assets/cards/common/goblin.png"),

  new Attacker(9, "Medic", 2, "Heals allied attackers.", {
    hp: 160, damage: 0, attackSpeed: 2, spawnCount: 1, favoriteTarget: "Allied wounded",
    ability: "Heals allies (25 HP).", disability: "No attack.", distractedBy: "Low HP ally."
  }, "/assets/cards/common/medic.png"),

  new Attacker(10, "Battle Ram", 4, "Siege engine for walls.", {
    hp: 900, damage: 180, attackSpeed: 3, spawnCount: 1, favoriteTarget: "Walls/Gates",
    ability: "2x vs walls.", disability: "Ignores troops.", distractedBy: "Blockers."
  }, "/assets/cards/rare/battleram.png"),

  new Attacker(18, "Shield Guard", 3, "Tanky frontline unit.", {
    hp: 600, damage: 25, attackSpeed: 2, spawnCount: 1, favoriteTarget: "Any",
    ability: "High HP tank.", disability: "Low damage.", distractedBy: "Closest."
  }, "/assets/cards/rare/shieldguard.png"),

  new Attacker(19, "Cavalry Rider", 4, "Fast mounted warrior.", {
    hp: 350, damage: 85, attackSpeed: 1.5, spawnCount: 1, favoriteTarget: "Any",
    ability: "Charge: 2x first hit.", disability: "Fragile after charge.", distractedBy: "Nearest."
  }, "/assets/cards/rare/cavalryrider.png"),

  new Attacker(20, "Fire Thrower", 3, "Area damage specialist.", {
    hp: 200, damage: 60, attackSpeed: 2, spawnCount: 1, favoriteTarget: "Clusters",
    ability: "Splash fire damage.", disability: "Low HP.", distractedBy: "Largest group."
  }, "/assets/cards/rare/firethrower.png"),

  new Attacker(11, "Catapult", 5, "Splash vs buildings.", {
    hp: 500, damage: 150, range: 12, attackSpeed: 4, spawnCount: 1, favoriteTarget: "Buildings",
    ability: "Splash, +50% vs buildings.", disability: "Weak melee.", distractedBy: "Clusters."
  }, "/assets/cards/epic/catapult.png"),

  new Attacker(12, "War Elephant", 7, "Heavy trampling unit.", {
    hp: 1200, damage: 110, attackSpeed: 1, spawnCount: 1, favoriteTarget: "Any",
    ability: "Tramples units.", disability: "Slow movement.", distractedBy: "Clusters."
  }, "/assets/cards/epic/warelephant.png"),

  new Attacker(13, "Assassins", 6, "Stealth high-damage strike.", {
    hp: 400, damage: 250, attackSpeed: 3, spawnCount: 1, favoriteTarget: "Towers",
    ability: "Invisible for 3s.", disability: "Fragile once revealed.", distractedBy: "None."
  }, "/assets/cards/epic/assassins.png"),

  new Attacker(21, "Spearmen", 2, "Anti-cavalry infantry.", {
    hp: 150, damage: 30, attackSpeed: 1.2, spawnCount: 1, favoriteTarget: "Any",
    ability: "+50% vs cavalry.", disability: "Average stats.", distractedBy: "Closest."
  }, "/assets/cards/common/spearmen.png"),
];

// ── Filtered exports ────────────────────────
export const DEFENSE_CARDS: Card[] = ALL_CARDS.filter(c => c.subType === "defense");
export const ATTACK_CARDS: Card[] = ALL_CARDS.filter(c => c.subType === "attack");
export const ALL_CARDS_REGISTRY: Card[] = ALL_CARDS;

export function getCardById(id: number): Card | undefined {
  return ALL_CARDS.find(c => c.id === id);
}
