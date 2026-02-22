const Tile = require('./Tile');

class Board {
  constructor(playerA, playerB) {
    this.grid = this.generateBoard(playerA, playerB);
  }

  generateBoard(playerA, playerB) {
    const grid = [];
    const layout = [
      [{}, { mainTree: true }, {}],
      [{ inactive: true }, {}, {}, {}, { inactive: true }],
      [{ inactive: true }, {}, {}, {}, { inactive: true }],
      [{}, { mainTree: true }, {}],
    ];

    for (let r = 0; r < 4; r++) {
      const row = [];
      for (let c = 0; c < layout[r].length; c++) {
        const owner = r >= 2 ? playerA : playerB;
        row.push(new Tile(r, c, layout[r][c].mainTree || false, layout[r][c].inactive || false, owner));
      }
      grid.push(row);
    }
    return grid;
  }

  getTile(row, col) {
    if (row < 0 || row >= this.grid.length) return null;
    if (col < 0 || col >= this.grid[row].length) return null;
    return this.grid[row][col];
  }

  getAllTiles() {
    const tiles = [];
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        if (!this.grid[r][c].isInactive) {
          tiles.push(this.grid[r][c]);
        }
      }
    }
    return tiles;
  }
}

module.exports = Board;
