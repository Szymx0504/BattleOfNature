const Action = require('./Action');
const { healObject } = require('../../../utilities'); // Temporary bind

class DealDamageAction extends Action {
  constructor(sourceOwner, sourceName, targetCard, amount, isSpell = false) {
    super();
    this.sourceOwner = sourceOwner;
    this.sourceName = sourceName;
    this.targetCard = targetCard;
    this.amount = amount;
    this.isSpell = isSpell;
  }

  execute(game) {
    if (this.targetCard.hp <= 0) return; // Already dead from previous action in queue

    // Pre-damage hooks (e.g. shielding, interceptors) could go here

    this.targetCard.hp -= this.amount;
    if (this.targetCard.isMainTree) {
      game.players[this.targetCard.owner].mainTree = this.targetCard.hp;
    }
    
    // The target gets an opportunity to react
    if (typeof this.targetCard.onDamaged === 'function') {
      this.targetCard.onDamaged(this.amount, { owner: this.sourceOwner, name: this.sourceName });
    }

    game.actionQueue.addChange({
      action: this.targetCard.hp <= 0 ? "death" : "damageTaken",
      row: this.targetCard.tile ? this.targetCard.tile.row : (this.targetCard.isMainTree ? (this.targetCard.owner === game.playerAId ? 3 : 0) : 0),
      col: this.targetCard.tile ? this.targetCard.tile.col : 1,
      owner: this.targetCard.owner,
      name: this.targetCard.name,
      ...(this.targetCard.hp > 0 ? { value: this.amount } : {}),
      by: this.sourceName,
    });

    if (this.targetCard.hp <= 0) {
      // Schedule death
      const DeathAction = require('./DeathAction');
      game.actionQueue.enqueue(new DeathAction(this.targetCard));
    }
  }
}

module.exports = DealDamageAction;
