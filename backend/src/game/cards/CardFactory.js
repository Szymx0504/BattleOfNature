const Card = require('./Card');
const { cardProperties } = require('../../../utilities'); // we can move these properties here later or import

// Base classes
class Tree extends Card {
  constructor(name, owner, game) {
    super(name, owner, game);
    const props = cardProperties[name];
    this.hp = props.hp;
    this.dmg = props.dmg;
    this.pts = props.pts;
    this.type = "tree";
    this.rarity = props.rarity;
    this.description = props.description;
  }
}

class Bush extends Card {
  constructor(name, owner, game) {
    super(name, owner, game);
    const props = cardProperties[name];
    this.hp = props.hp;
    this.dmg = props.dmg;
    this.pts = props.pts;
    this.type = "bush";
    this.rarity = props.rarity;
    this.description = props.description;
  }
}

class Spell extends Card {
  constructor(name, owner, game) {
    super(name, owner, game);
    const props = cardProperties[name];
    this.pts = props.pts;
    this.hp = props.hp;
    this.dmg = props.dmg || 0;
    this.type = "spell";
    this.rarity = props.rarity;
    this.description = props.description;
  }

  isValidTarget(targetCard, isMainTree, playerId) {
    if (!targetCard) return { error: "No available target" };
    const isGoodSpell = ["medicinal herbs", "magic force"].includes(this.name);
    if (!isGoodSpell && targetCard.owner === playerId) return { error: "No available target" };
    if (isGoodSpell && targetCard.owner !== playerId) return { error: "No available target" };
    
    if (targetCard.isResistantTo(this.name)) return { error: `${targetCard.name} are resistant to spells` };
    
    return { success: true };
  }
}

// Special Cards implemented so far in your code
class Creepers extends Bush {
  canAttackTarget(targetCard, sourceRow, sourceColGeo, targetRow, targetColGeo) {
    // Creepers must attack the main tree
    return targetCard && targetCard.name === "main tree" && targetCard.owner !== this.owner;
  }
  
  isResistantTo(spellCardName) {
    return !["medicinal herbs", "magic force"].includes(spellCardName);
  }
}

class Linden extends Tree {
  onDamaged(damage, sourceCard) {
    // When attacked, doubles attack up to 32
    if (this.dmg < 32) {
      this.game.actionQueue.addChange({
        action: "linden",
        owner: this.owner,
        name: this.name,
      });
    }
    this.dmg = Math.min(32, this.dmg * 2);
  }
}

class Oxytree extends Tree {
  onTurnStart() {
    super.onTurnStart(); // Remember to call super to set hasAttack=true
    if (this.dmg < 12) {
      if (this.tile) { // Only if placed on the board!
        this.game.actionQueue.addChange({
          action: "oxytree",
          owner: this.owner,
          name: this.name,
        });
        this.dmg = Math.min(12, this.dmg + 2);
      }
    }
  }
}

class Chopper extends Bush {
  canAttackTarget(targetCard, sourceRow, sourceColGeo, targetRow, targetColGeo) {
    const { checkDistance } = require('../../../utilities');
    return checkDistance(sourceRow, sourceColGeo, targetRow, targetColGeo, true) <= 1;
  }
}

class Poplar extends Tree {
  getDamage(targetRow, targetColGeo) {
    if (!this.tile) return this.dmg[0];
    const { getColGeometrically, checkDistance } = require('../../../utilities');
    const sourceColGeo = getColGeometrically(this.tile.row, this.tile.col);
    const dist = checkDistance(this.tile.row, sourceColGeo, targetRow, targetColGeo, true);
    return dist <= 1 ? this.dmg[0] : this.dmg[1];
  }
}

class MedicinalHerbs extends Spell {
  // specific target healing logic handled in spell action
}

class MagicForce extends Spell {
  // reactivates a card
}

class BarkBeetles extends Spell {
  isValidTarget(targetCard, isMainTree, playerId) {
    const baseValidation = super.isValidTarget(targetCard, isMainTree, playerId);
    if (baseValidation.error) return baseValidation;
    
    if (targetCard.type !== "tree" && !isMainTree) {
      return { error: "No tree to attack" };
    }
    return { success: true };
  }
}

class CardFactory {
  static createCard(name, owner, game) {
    if (!cardProperties[name]) return null;

    switch (name) {
      case 'oxytree': return new Oxytree(name, owner, game);
      case 'linden': return new Linden(name, owner, game);
      case 'creepers': return new Creepers(name, owner, game);
      case 'chopper': return new Chopper(name, owner, game);
      case 'poplar': return new Poplar(name, owner, game);
      case 'medicinal herbs': return new MedicinalHerbs(name, owner, game);
      case 'magic force': return new MagicForce(name, owner, game);
      case 'bark beetles': return new BarkBeetles(name, owner, game);
      default:
        // Generic cards
        const type = cardProperties[name].type;
        if (type === 'tree') return new Tree(name, owner, game);
        if (type === 'bush') return new Bush(name, owner, game);
        if (type === 'spell') return new Spell(name, owner, game);
        // building etc.
        return new Card(name, owner, game);
    }
  }
}

module.exports = CardFactory;
