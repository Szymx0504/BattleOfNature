function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

function ifCurrentlyOwned(whoseMove, owner) {
  return whoseMove === owner;
}

function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateBoard(playerA, playerB) {
  const board = [
    [{}, { mainTree: true }, {}],
    [{ inactive: true }, {}, {}, {}, { inactive: true }],
    [{ inactive: true }, {}, {}, {}, { inactive: true }],
    [{}, { mainTree: true }, {}],
  ];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < board[i].length; j++) {
      board[i][j].cards = [];
      board[i][j].owner = i >= 2 ? playerA : playerB;
    }
  }
  return board;
}

function updateWhoseMove() {}

function adjustBoard(board, rotate) {
  if (rotate) {
    return board
      .slice()
      .reverse()
      .map((row) => row.slice().reverse());
  }
  return board;
}

function adjustCords(row, col, rotate) {
  if (rotate) {
    if (row == 0 || row == 3) {
      col = 2 - col;
    } else {
      col = 4 - col;
    }
    row = 3 - row;
  }
  return { row, col };
}

function getColGeometrically(row, col) {
  return row == 0 || row == 3 ? col + 1 : col;
}

function adjustVector(vector, rotate) {
  const newVector = vector.map((action) => ({ ...action }));
  if (rotate) {
    for (action of newVector) {
      const { row: newRow, col: newCol } = adjustCords(
        action.row,
        action.col,
        rotate
      );
      action.row = newRow;
      action.col = newCol;
    }
  }
  return newVector;
}

function dealDamage(targetCard, value){
  targetCard.hp -= value;
  // returns if died
  return targetCard.hp <= 0;
}

function healObject(targetCard, value){
  const newHp = Math.min(cardProperties[targetCard.name].hp + 1, targetCard.hp + value);
  const healedBy = newHp - targetCard.hp;
  targetCard.hp = newHp;
  // returns by how much healed
  return healedBy;
}

const cardTypes = ["tree", "spell", "bush", "building"];

const cardProperties = {
  timberman: {
    name: "timberman",
    pts: 5,
    dmg: 15,
    type: "spell",
    intendedFor: "aimed",
    rarity: "legendary",
  },
  acacia: {
    name: "acacia",
    hp: 3,
    pts: 5,
    dmg: 9,
    type: "tree",
    rarity: "rare",
  },
  chopper: {
    name: "chopper",
    hp: 9,
    pts: 6,
    dmg: 8,
    type: "bush",
    rarity: "rare",
  },
  creeper: {
    name: "creeper",
    hp: 6,
    pts: 3,
    dmg: 3,
    type: "bush",
    rarity: "rare",
  },
  linden: {
    name: "linden",
    hp: 14,
    pts: 5,
    dmg: 2,
    type: "tree",
    rarity: "rare",
  },
  "medicinal herbs": {
    name: "medicinal herbs",
    hp: 5,
    pts: 3,
    type: "spell",
    intendedFor: "aimed",
    rarity: "rare",
  },
  "apple tree": {
    name: "apple tree",
    hp: 7,
    pts: 3,
    dmg: 3,
    type: "tree",
    rarity: "common",
  },
  "bark beetles": {
    name: "bark beetles",
    pts: 3,
    dmg: 6,
    type: "spell",
    intendedFor: "aimed",
    rarity: "common",
  },
  birch: {
    name: "birch",
    hp: 12,
    pts: 4,
    dmg: 3,
    type: "tree",
    rarity: "common",
  },
  bush: {
    name: "bush",
    hp: 2,
    pts: 1,
    dmg: 1,
    type: "bush",
    rarity: "common",
  },
  chestnut: {
    name: "chestnut",
    hp: 6,
    pts: 4,
    dmg: 5,
    type: "tree",
    rarity: "common",
  },
  pine: {
    name: "pine",
    hp: 9,
    pts: 3,
    dmg: 2,
    type: "tree",
    rarity: "common",
  },
  poplar: {
    name: "poplar",
    hp: 7,
    pts: 3,
    dmg: [4, 1],
    type: "tree",
    rarity: "common",
  },
  spruce: {
    name: "spruce",
    hp: 4,
    pts: 2,
    dmg: 2,
    type: "tree",
    rarity: "common",
  },
  willow: {
    name: "willow",
    hp: 17,
    pts: 8,
    dmg: 5,
    type: "tree",
    rarity: "common",
  },
};

module.exports = {
  cardProperties,
  cardTypes,
  shuffleArray,
  ifCurrentlyOwned,
  generateGameId,
  generateBoard,
  updateWhoseMove,
  adjustBoard,
  adjustCords,
  getColGeometrically,
  adjustVector,
  dealDamage,
  healObject
};
