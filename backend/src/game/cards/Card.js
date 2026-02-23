class Card {
  constructor(name, owner, game) {
    this.name = name;
    this.owner = owner;
    this.game = game;
    this.tile = null; // Assigned when placed on Board
    
    // Default properties
    this.hp = 0;
    this.dmg = 0;
    this.pts = 0;
    this.type = null;
    this.rarity = null;
    this.description = null;
    this.hasAttack = false;
    this.placedThisTurn = false;
  }

  // --- HOOKS ---
  
  onPlay(targetTile) {
    // Default: just place on tile
  }

  onAttack(targetCard) {
    // Default effect when this card attacks targetCard
  }

  onDamaged(damage, sourceCard) {
    // Default: lose HP and die if <= 0
  }

  onDeath() {
    // Default: remove from tile
  }

  onTurnStart() {
    this.placedThisTurn = false;
    this.hasAttack = true; 
  }

  onTurnEnd() {
    // Default effect at turn end
  }

  isResistantTo(spellCardName) {
    return false; // Default: affected by all spells
  }

  getDamage(targetRow, targetColGeo) {
    return this.dmg;
  }

  canAttackTarget(targetCard, sourceRow, sourceColGeo, targetRow, targetColGeo) {
    return true; // Default: Can attack anything if standard rules allow
  }

  canBypassMainTreeProtection() {
    return false; // Default: Cannot attack Main Tree if other enemies exist
  }
}

module.exports = Card;
