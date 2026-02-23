class Player {
  constructor(id, deck) {
    this.id = id;
    this.deck = [...deck];
    this.hand = this.deck.slice(0, 5);
    this.cycle = this.deck.slice(-10);
    this.pts = 5;
    this.passed = false;
    this.mainTree = 25;
    this.globalTime = 180;
    this.activeSpells = []; // Delayed spells waiting to trigger
  }
}

module.exports = Player;
