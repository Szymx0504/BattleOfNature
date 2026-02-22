class Tile {
  constructor(row, col, isMainTree = false, isInactive = false, owner = null) {
    this.row = row;
    this.col = col;
    this.isMainTree = isMainTree;
    this.isInactive = isInactive;
    this.owner = owner;
    this.cards = [];
  }

  addCard(card) {
    this.cards.push(card);
    card.tile = this; 
  }

  removeCard(card) {
    this.cards = this.cards.filter(c => c !== card);
    card.tile = null;
  }

  getTopCard() {
    return this.cards.length > 0 ? this.cards[this.cards.length - 1] : null;
  }

  hasCardType(type) {
    return this.cards.some(c => c.type === type);
  }
}

module.exports = Tile;
