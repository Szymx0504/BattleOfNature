const Board = require('./Board');
const Player = require('./Player');
const ActionQueue = require('./ActionQueue');

class Game {
  constructor(id, playerAId, playerADeck, playerBId, playerBDeck, starts) {
    this.id = id;
    this.playerAId = playerAId;
    this.playerBId = playerBId;
    this.players = {
      [playerAId]: new Player(playerAId, playerADeck),
      [playerBId]: new Player(playerBId, playerBDeck)
    };
    this.board = new Board(playerAId, playerBId);
    this.actionQueue = new ActionQueue(this);
    
    this.whoseMove = starts ? playerAId : playerBId;
    this.whoStartedTurn = this.whoseMove;
    this.turnNumber = 0;
    
    this.actionStartedAt = Date.now();
    this.winner = null;
  }

  getOpponentId(playerId) {
    return Object.keys(this.players).find(id => id !== playerId);
  }

  playCard(playerId, cardName, targetCoords, specialParams) {
    this.actionQueue.clearHistory();
    // 1. Validation logic here
    // 2. Add appropriate PlayCard action to queue
    // 3. Process the queue
    this.actionQueue.process();
    return this.actionQueue.getHistory();
  }

  makeAttack(playerId, sourceCoords, targetCoords) {
    this.actionQueue.clearHistory();
    // 1. Validation logic here
    // 2. Add appropriate attack action to queue
    // 3. Process the queue
    this.actionQueue.process();
    return this.actionQueue.getHistory();
  }

  exportBoard() {
    return this.board.grid.map(row => 
      row.map(tile => ({
        row: tile.row,
        col: tile.col,
        owner: tile.owner,
        mainTree: tile.isMainTree,
        inactive: tile.isInactive,
        cards: tile.cards.map(c => ({
          name: c.name,
          hp: c.hp,
          dmg: c.dmg,
          pts: c.pts,
          type: c.type,
          rarity: c.rarity,
          description: c.description,
          hasAttack: c.hasAttack,
          placedThisTurn: c.placedThisTurn,
          owner: c.owner
        }))
      }))
    );
  }

  exportGame() {
    return {
      players: this.players,
      whoseMove: this.whoseMove,
      whoStartedTurn: this.whoStartedTurn,
      turnNumber: this.turnNumber,
      actionStartedAt: this.actionStartedAt,
      winner: this.winner
    };
  }
}

module.exports = Game;
