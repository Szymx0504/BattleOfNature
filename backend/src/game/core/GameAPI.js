const PlayCardAction = require('../actions/PlayCardAction');
const DealDamageAction = require('../actions/DealDamageAction');
const { cardProperties, adjustCords, checkAttacksLeft, getColGeometrically, checkDistance, checkOpponentsMainTree, checkAnyEnemies } = require('../../../utilities');

class GameAPI {
  // We can attach these methods to the Game class or a GameController
  static validateAndPlayCard(game, playerId, cardName, incomingRow, incomingCol, special, isRotate) {
    const player = game.players[playerId];
    const enemyId = game.getOpponentId(playerId);

    if (game.whoseMove !== playerId) return { error: "Not your turn" };
    if (player.pts < cardProperties[cardName].pts) return { error: "Not enough points" };
    if (!player.hand.includes(cardName)) return { error: "You do not have that card" };

    const { row, col } = adjustCords(incomingRow, incomingCol, isRotate);
    const colGeo = getColGeometrically(row, col);
    
    if (row < 0 || row > 3 || colGeo < 1 || colGeo > 3) return { error: "No such tile exists" };
    
    const tile = game.board.getTile(row, col);

    if (cardProperties[cardName].type !== "spell") {
      if (cardName === "creepers") {
        if (colGeo !== 2 || (isRotate && row !== 3) || (!isRotate && row !== 0)) {
          return { error: "Creepers must be placed on opponent's Main Tree" };
        }
      } else if (tile.owner !== playerId) {
        return { error: "The tile does not belong to you" };
      }
      
      if (cardName !== "creepers" && tile.isMainTree) {
        return { error: "You cannot place a card on the Main Tree" };
      }
      
      if (tile.cards.length > 0) return { error: "Tile already occupied" };
    } else {
      // Spell validation logic shifted to OOP subclasses
      const isGoodSpell = ["medicinal herbs", "magic force"].includes(cardName);
      const mainTree = checkOpponentsMainTree(row, col, isRotate);
      
      let targetCardObj = tile.getTopCard();
      if (mainTree && !isGoodSpell) {
         targetCardObj = { 
            name: "main tree", 
            hp: game.players[enemyId].mainTree, 
            owner: enemyId,
            type: "tree",
            isMainTree: true,
            isResistantTo: () => false
         };
      }

      const spellCard = require('../cards/CardFactory').createCard(cardName, playerId, game);
      const validation = spellCard.isValidTarget(targetCardObj, mainTree, playerId);
      if (validation.error) return validation;
      if (targetCardObj && targetCardObj.name === "main tree" && checkAnyEnemies(game.board.grid, enemyId, true)) {
         return { error: "Cannot attack main tree. Enemies on board" };
      }
      
      if (cardName === "magic force") {
        if (targetCardObj.placedThisTurn) return { error: "The card has been placed this turn. It cannot be reactivated yet" };
        if (!special) return { error: "No target card specified" };
        let enemyCard = false;
        for (const boardTile of game.board.getAllTiles()) {
           if (boardTile.cards.find(c => c.name === special.name && c.owner === enemyId)) { enemyCard = true; break; }
        }
        if (!enemyCard) return { error: "No target card found" };
      }
    }

    // Time Check
    const { manageTime } = require('../../../utilities');
    if (!manageTime(game, playerId)) return { timeout: true };

    // Deduction
    player.hand = player.hand.filter(c => c !== cardName);
    player.pts -= cardProperties[cardName].pts;
    if (!game.players[enemyId].passed) {
      game.whoseMove = enemyId;
    }

    // Process Action
    game.actionQueue.clearHistory();
    game.actionQueue.enqueue(new PlayCardAction(playerId, cardName, row, col, special));
    
    // Process spells specifically
    if (cardProperties[cardName].type === "spell") {
       // We would enqueue spell effects here directly instead of putting them on the board
       // ... implementations of medicinal herbs, etc will go dynamically here or inside the spell's PlayCard hook
       // For now, let's keep it simple as it's just a refactor layout
    }

    game.actionQueue.process();
    return { success: true, history: game.actionQueue.getHistory() };
  }

  static validateAndAttack(game, playerId, sourceCardInfo, targetCardInfo, isRotate) {
    const player = game.players[playerId];
    const enemyId = game.getOpponentId(playerId);

    if (game.whoseMove !== playerId) return { error: "Not your turn" };

    const mainTree = targetCardInfo.name === "main tree";

    if (sourceCardInfo?.row === undefined || sourceCardInfo?.col === undefined || targetCardInfo?.row === undefined || targetCardInfo?.col === undefined) {
      return { error: "Coords must not be undefined" };
    }
    if (!Object.keys(cardProperties).includes(sourceCardInfo?.name) || (!mainTree && !Object.keys(cardProperties).includes(targetCardInfo?.name))) {
      return { error: "A given card does not exist" };
    }

    if (mainTree && !["creepers"].includes(sourceCardInfo?.name) && checkAnyEnemies(game.board.grid, enemyId)) {
      return { error: "Cannot attack main tree. Enemies on board" };
    }

    const { row: sourceRow, col: sourceCol } = adjustCords(sourceCardInfo.row, sourceCardInfo.col, isRotate);
    const { row: targetRow, col: targetCol } = adjustCords(targetCardInfo.row, targetCardInfo.col, isRotate);
    const sourceColGeo = getColGeometrically(sourceRow, sourceCol);
    const targetColGeo = getColGeometrically(targetRow, targetCol);

    if (sourceRow < 0 || sourceRow > 3 || sourceColGeo < 1 || sourceColGeo > 3 || targetRow < 0 || targetRow > 3 || targetColGeo < 1 || targetColGeo > 3) {
      return { error: "Invalid coordinates" };
    }

    const sourceCard = game.board.getTile(sourceRow, sourceCol)?.cards.find(c => c.name === sourceCardInfo.name && c.owner === playerId);
    const targetCard = mainTree ? { owner: enemyId, name: "main tree", hp: game.players[enemyId].mainTree, type: "tree", isMainTree: true } : game.board.getTile(targetRow, targetCol)?.cards.find(c => c.name === targetCardInfo.name && c.owner === enemyId);

    if (!sourceCard || !targetCard) return { error: "Invalid cards chosen" };
    if (sourceCard.owner !== playerId) return { error: "This card does not belong to you" };
    if (targetCard.owner === playerId) return { error: "You must not attack your card" };
    if (!sourceCard.hasAttack) return { error: "This card cannot attack now" };

    if (!sourceCard.canAttackTarget(targetCard, sourceRow, sourceColGeo, targetRow, targetColGeo)) {
      if (sourceCard.name === "chopper") return { error: "Invalid range" };
      if (sourceCard.name === "creepers") return { error: "Creepers must attack the main tree!" };
      return { error: "Invalid target for this card" };
    }

    // Time Check
    const { manageTime } = require('../../../utilities');
    if (!manageTime(game, playerId)) return { timeout: true };

    // Action Queue Execution
    game.actionQueue.clearHistory();
    
    // Evaluate dmg
    let dmgValue = sourceCard.getDamage(targetRow, targetColGeo);

    const DealDamageAction = require('../actions/DealDamageAction');
    game.actionQueue.enqueue(new DealDamageAction(playerId, sourceCard.name, targetCard, dmgValue, false));
    
    sourceCard.hasAttack = false;
    
    if (!game.players[enemyId].passed) {
      game.whoseMove = enemyId;
    }

    game.actionQueue.process();
    return { success: true, history: game.actionQueue.getHistory(), winner: game.winner };
  }

  static passTurn(game, playerId, isRotate) {
    if (game.whoseMove !== playerId) return { error: "Not your turn" };
    if (game.players[playerId].passed) return { error: "You have already passed this turn!" };

    // Check if attacks are left
    const tilesToMap = game.board.grid.map(row => row.map(tile => ({ cards: tile.cards })));
    if (checkAttacksLeft(tilesToMap, playerId, isRotate)) {
       return { error: "Some of your cards still have an attack to be performed!" };
    }

    // Time Check
    const { manageTime } = require('../../../utilities');
    if (!manageTime(game, playerId)) return { timeout: true };

    game.players[playerId].passed = true;
    const enemyId = game.getOpponentId(playerId);
    
    game.actionQueue.clearHistory();

    if (game.players[enemyId].passed) {
       // Turn finishes
       game.actionQueue.addChange({ action: "newTurn" });
       if (game.turnNumber !== 0) {
         game.whoStartedTurn = Object.keys(game.players).find(id => id !== game.whoStartedTurn);
       }
       game.whoseMove = game.whoStartedTurn;
       game.turnNumber++;
       
       if (game.turnNumber <= 12) {
         game.players[playerId].pts = 10;
         game.players[enemyId].pts = 10;
       } else {
         game.players[playerId].pts = 15;
         game.players[enemyId].pts = 15;
       }
       game.players[playerId].passed = false;
       game.players[enemyId].passed = false;
       
       // Reset cards
       for (const tile of game.board.getAllTiles()) {
         for (const card of tile.cards) {
           card.hasAttack = true;
           card.placedThisTurn = false;
           card.onTurnStart(); // Hooks
         }
       }
       
       // Draw cards
       while(game.players[playerId].hand.length < 5 && game.players[playerId].cycle.length > 0) {
         game.players[playerId].hand.push(game.players[playerId].cycle[0]);
         game.players[playerId].cycle.shift();
       }
       while(game.players[enemyId].hand.length < 5 && game.players[enemyId].cycle.length > 0) {
         game.players[enemyId].hand.push(game.players[enemyId].cycle[0]);
         game.players[enemyId].cycle.shift();
       }
       return { success: true, newTurn: true, history: game.actionQueue.getHistory() };
    } else {
      game.whoseMove = enemyId;
      game.actionQueue.addChange({ action: "passed", by: playerId });
      return { success: true, newTurn: false, history: game.actionQueue.getHistory() };
    }
  }
}

module.exports = GameAPI;
