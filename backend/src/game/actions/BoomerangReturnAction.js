const Action = require('./Action');

class BoomerangReturnAction extends Action {
  constructor(playerId, cardName, path, enemyId) {
    super();
    this.playerId = playerId;
    this.cardName = cardName;
    this.path = path;
    this.enemyId = enemyId;
  }

  execute(game) {
    let hitSomething = false;
    const DealDamageAction = require('./DealDamageAction');
    const CardFactory = require('../cards/CardFactory');
    const sourceObj = CardFactory.createCard(this.cardName, this.playerId, game);

    // Retrace path sequentially backwards (Boomerang effect)
    for (let i = this.path.length - 1; i >= 0; i--) {
      const step = this.path[i];
      const tile = game.board.grid[step.row][step.colIndex];
      
      if (tile.isMainTree && tile.owner === this.enemyId) {
        const mtInfo = { 
          owner: this.enemyId, 
          name: "main tree", 
          hp: game.players[this.enemyId].mainTree, 
          type: "tree", 
          isMainTree: true 
        };
        // 2 damage on return trip to the main tree (6 damage total)
        game.actionQueue.enqueue(new DealDamageAction(this.playerId, this.cardName, mtInfo, sourceObj.dmg[0] * 2, false));
        hitSomething = true;
      } else {
        const enemyCards = tile.cards.filter(c => c.owner === this.enemyId);
        for (const ec of enemyCards) {
          // 1 damage on return trip parsing whatever is still alive! (index 0 of array)
          game.actionQueue.enqueue(new DealDamageAction(this.playerId, this.cardName, ec, sourceObj.dmg[0], false));
          hitSomething = true;
        }
      }
    }

    // "If coming back hits nothing, gives you 1pts"
    if (!hitSomething) {
      game.players[this.playerId].pts += 1;
    }
  }
}

module.exports = BoomerangReturnAction;
