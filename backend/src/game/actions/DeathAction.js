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

    // Call death hook (e.g. explosive tree, truffle logic)
    this.card.onDeath();
  }
}

module.exports = DeathAction;
