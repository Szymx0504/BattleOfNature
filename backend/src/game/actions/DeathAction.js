const Action = require('./Action');

class DeathAction extends Action {
  constructor(card) {
    super();
    this.card = card;
  }

  execute(game) {
    // Only execute if actually on board / valid
    if (this.card.name === "main tree") {
      game.winner = game.getOpponentId(this.card.owner);
      return; 
    }

    if (this.card.tile) {
      this.card.tile.removeCard(this.card);
    }
    
    // Add to cycle
    game.players[this.card.owner].cycle.push(this.card.name);

    // Deactivate any active spells targeting this dead card
    for (const pid of Object.keys(game.players)) {
      const player = game.players[pid];
      const remaining = [];
      for (const spell of player.activeSpells) {
        // Remove this card from spell's targets
        spell.targets = spell.targets.filter(t => t !== this.card);
        if (spell.targets.length === 0) {
          // All targets dead — deactivate spell, return to cycle
          player.cycle.push(spell.name);
          game.actionQueue.addChange({
            action: "spellDeactivated",
            owner: spell.owner,
            name: spell.name,
          });
        } else {
          remaining.push(spell);
        }
      }
      player.activeSpells = remaining;
    }

    // Call death hook (e.g. explosive tree, truffle logic)
    this.card.onDeath();
  }
}

module.exports = DeathAction;
