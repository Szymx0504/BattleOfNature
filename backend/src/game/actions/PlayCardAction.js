const Action = require('./Action');

class PlayCardAction extends Action {
  constructor(playerId, cardName, targetRow, targetCol, special = null) {
    super();
    this.playerId = playerId;
    this.cardName = cardName;
    this.targetRow = targetRow;
    this.targetCol = targetCol;
    this.special = special;
  }

  execute(game) {
    const tile = game.board.getTile(this.targetRow, this.targetCol);
    if (!tile) return; // Validation already passed, this is a safety check

    const CardFactory = require('../cards/CardFactory');
    const card = CardFactory.createCard(this.cardName, this.playerId, game);
    
    // Spells resolve immediately and don't go on the board
    if (card.type === 'spell') {
      const { checkOpponentsMainTree } = require('../../../utilities');
      const isRotate = game.playerAId !== this.playerId; // playerB gets true here
      const isMainTree = checkOpponentsMainTree(this.targetRow, this.targetCol, isRotate);
      const enemyId = game.getOpponentId(this.playerId);

      const targetCard = isMainTree && !["medicinal herbs", "magic force"].includes(this.cardName) ? {
        owner: enemyId,
        name: "main tree",
        hp: game.players[enemyId].mainTree,
        type: "tree",
        isMainTree: true
      } : tile.getTopCard();

      if (this.cardName === "medicinal herbs") {
        const { healObject } = require('../../../utilities');
        game.actionQueue.addChange({
          action: "heal",
          row: this.targetRow,
          col: this.targetCol,
          owner: this.playerId,
          name: targetCard.name,
          value: healObject(targetCard, card.hp),
          by: this.cardName,
        });
      } else if (this.cardName === "magic force") {
        game.actionQueue.addChange({
          action: "reactivate",
          row: this.targetRow,
          col: this.targetCol,
          owner: this.playerId,
          name: targetCard.name,
          by: this.cardName,
        });
        
        if (this.special) {
          let enemyCardInfo = null;
          if (this.special.name === "main tree") {
             const enemyId = game.getOpponentId(this.playerId);
             enemyCardInfo = { 
                name: "main tree",
                hp: game.players[enemyId].mainTree,
                owner: enemyId,
                type: "tree",
                isMainTree: true
             };
          } else {
             const enemyId = game.getOpponentId(this.playerId);
             for (const boardTile of game.board.getAllTiles()) {
                const found = boardTile.cards.find(c => c.name === this.special.name && c.owner === enemyId);
                if (found) { enemyCardInfo = found; break; }
             }
          }

          if (enemyCardInfo) {
             const enemyId = game.getOpponentId(this.playerId);
             const { getColGeometrically } = require('../../../utilities');
             const targetRow = enemyCardInfo.tile ? enemyCardInfo.tile.row : (enemyCardInfo.isMainTree ? (enemyCardInfo.owner === enemyId ? 0 : 3) : 0);
             const targetCol = enemyCardInfo.tile ? enemyCardInfo.tile.col : 1;
             const targetColGeo = getColGeometrically(targetRow, targetCol);
             
             let dmgValue = targetCard.getDamage(targetRow, targetColGeo);
             
             const DealDamageAction = require('./DealDamageAction');
             // dmgValue is applied from targetCard onto enemyCardInfo
             game.actionQueue.enqueue(new DealDamageAction(this.playerId, targetCard.name, enemyCardInfo, dmgValue, false));
          }
        }
      } else if (card.delayed) {
        // Delayed spells (meteorite, hail, etc.)
        // Deal instant damage component if > 0
        if (targetCard && card.instantDmg > 0) {
          const DealDamageAction = require('./DealDamageAction');
          game.actionQueue.enqueue(new DealDamageAction(this.playerId, this.cardName, targetCard, card.instantDmg, true));
        }
        // Store the delayed portion in activeSpells
        game.players[this.playerId].activeSpells.push({
          name: this.cardName,
          owner: this.playerId,
          targets: [targetCard], // Array for future multi-target spells like acid rain
          dmg: card.delayedDmg,
          turnsLeft: 1,
        });
      } else {
        // Generic instant damage spells (timberman, etc.)
        if (targetCard && card.dmg > 0) {
          const DealDamageAction = require('./DealDamageAction');
          game.actionQueue.enqueue(new DealDamageAction(this.playerId, this.cardName, targetCard, card.dmg, true));
        }
      }

      game.actionQueue.addChange({
        action: "played",
        row: this.targetRow,
        col: this.targetCol,
        owner: this.playerId,
        name: this.cardName,
      });

      // Delayed spells don't go to cycle yet — they go when they trigger or deactivate
      if (!card.delayed) {
        game.players[this.playerId].cycle.push(this.cardName);
      }
    } else {
      // It's a placeable entity
      tile.addCard(card);
      card.placedThisTurn = true;
      card.hasAttack = false;

      game.actionQueue.addChange({
        action: "place",
        row: this.targetRow,
        col: this.targetCol,
        owner: this.playerId,
        name: this.cardName,
      });

      // Hook integration
      card.onPlay(tile);
    }
  }
}

module.exports = PlayCardAction;
