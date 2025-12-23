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

function getColIndexWise(row, colGeo) {
  return row === 0 || row === 3 ? colGeo - 1 : colGeo;
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

// by either object or spell
function dealDamage(targetCard, value, changesVector) {
  targetCard.hp -= value;
  if (targetCard.name === "linden") {
    // info that linden doubled its attack (?)
    if (targetCard.dmg < 32) {
      changesVector.push({
        action: "linden",
        owner: targetCard.owner,
        name: targetCard.name,
      });
    }
    targetCard.dmg *= 2;
  }
  // returns if died
  return targetCard.hp <= 0;
}

function healObject(targetCard, value) {
  const newHp = Math.min(
    cardProperties[targetCard.name].hp + 1,
    targetCard.hp + value
  );
  const healedBy = newHp - targetCard.hp;
  targetCard.hp = newHp;
  // returns by how much healed
  return healedBy;
}

// remember: geo columns!!!
function checkDistance(
  sourceRow,
  sourceColGeo,
  targetRow,
  targetColGeo,
  diagonally
) {
  const rowDist = Math.abs(sourceRow - targetRow);
  const colDist = Math.abs(sourceColGeo - targetColGeo);
  return diagonally ? Math.max(rowDist, colDist) : rowDist + colDist;
}

function checkAnyEnemies(board, enemyId, spell) {
  // also account for if attack value > 0 or has a special effect IMPORTANT
  return board.some((row) =>
    row.some((tile) =>
      tile.cards.some(
        (card) => card.owner === enemyId && (!spell || card.name !== "creepers")
      )
    )
  );
}

function checkOpponentsMainTree(row, col, rotate) {
  // col index wise!!!
  return row === (rotate ? 3 : 0) && col === 1;
}

function checkAttacksLeft(board, playerId, rotate) {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      for (const cardObj of board[row][col].cards) {
        if (cardObj.hasAttack && cardObj.owner === playerId) {
          // account for cards with limited ranges or idk if we add potato later on - that may complicate things a lot
          if (cardObj.name === "chopper") {
            const colGeo = getColGeometrically(row, col);
            for (let dy = -1; dy < 2; dy++) {
              for (let dx = -1; dx < 2; dx++) {
                const new_row = row + dy;
                const new_colGeo = colGeo + dx;
                // assumption: no enemy ONTOP of you, also -> account coording when adding Ground card (add forbidden tiles (0,0), (0,4), (3,0), (3,4) and colGeo between 0 and 4)
                if (
                  (dy != 0 || dx != 0) &&
                  new_row >= 0 &&
                  new_row <= 3 &&
                  new_colGeo >= 1 &&
                  new_colGeo <= 3
                ) {
                  for (const card of board[new_row][
                    getColIndexWise(new_row, new_colGeo)
                  ].cards) {
                    if (card.owner !== playerId) {
                      return true;
                    }
                  }
                }
              }
            }
            // will be possible with wichura, check if it will work then
            const oppMainTreeRow = rotate ? 3 : 0;
            const oppMainTreeColGeo = 2;
            if (
              checkDistance(
                row,
                colGeo,
                oppMainTreeRow,
                oppMainTreeColGeo,
                true
              ) <= 1
            ) {
              return true;
            }
          } else return true;
        }
      }
    }
  }
}

function manageTime(game, playerId) {
  const now = Date.now();
  const timeSpent = (now - game.actionStartedAt) / 1000;
  if (timeSpent > 30) {
    const extraTime = timeSpent - 30;
    game.players[playerId].globalTime -= extraTime;
    if (game.players[playerId].globalTime < 0) {
      game.players[playerId].globalTime = 0;
    }
    if (game.players[playerId].globalTime <= 0) {
      return false; // koniec gry
    }
  }
  return true;
}

function handleTimeout(game, playerId, enemyId, io, activeGames, gameId) {
  io.to(playerId).emit("timeOver", {won: false});
  io.to(enemyId).emit("timeOver", {won: true});

  if (game.forceEndTimer) {
    clearTimeout(game.forceEndTimer);
    game.forceEndTimer = null;
  }
  activeGames.delete(gameId);
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
    description: "Spell which evokes a timberman",
  },
  acacia: {
    name: "acacia",
    hp: 3,
    pts: 5,
    dmg: 9,
    type: "tree",
    rarity: "rare",
    description: "A delicate tree",
  },
  chopper: {
    name: "chopper",
    hp: 9,
    pts: 6,
    dmg: 8,
    type: "bush",
    rarity: "rare",
    description: "Range of 1 tile",
  },
  creepers: {
    name: "creepers",
    hp: 6,
    pts: 3,
    dmg: 3,
    type: "bush",
    rarity: "rare",
    description:
      "Attack and grow on the main tree. Resistant to opponent's spells",
  },
  linden: {
    name: "linden",
    hp: 14,
    pts: 5,
    dmg: 2,
    type: "tree",
    rarity: "rare",
    description: "Doubles its current attack when it is attacked (up to 32)",
  },
  "medicinal herbs": {
    name: "medicinal herbs",
    hp: 5,
    pts: 3,
    type: "spell",
    intendedFor: "aimed",
    rarity: "rare",
    description: "Heals the chosen object",
  },
  "apple tree": {
    name: "apple tree",
    hp: 7,
    pts: 3,
    dmg: 3,
    type: "tree",
    rarity: "common",
    description: "A rain od apples",
  },
  "bark beetles": {
    name: "bark beetles",
    pts: 3,
    dmg: 6,
    type: "spell",
    intendedFor: "aimed",
    rarity: "common",
    description: "They work only on trees",
  },
  birch: {
    name: "birch",
    hp: 12,
    pts: 4,
    dmg: 3,
    type: "tree",
    rarity: "common",
    description: "A solid tree",
  },
  bush: {
    name: "bush",
    hp: 2,
    pts: 1,
    dmg: 1,
    type: "bush",
    rarity: "common",
    description: "A small bush",
  },
  chestnut: {
    name: "chestnut",
    hp: 6,
    pts: 4,
    dmg: 5,
    type: "tree",
    rarity: "common",
    description: "Attacks with chestnuts",
  },
  pine: {
    name: "pine",
    hp: 9,
    pts: 3,
    dmg: 2,
    type: "tree",
    rarity: "common",
    description: "A medium-sized tree",
  },
  poplar: {
    name: "poplar",
    hp: 7,
    pts: 3,
    dmg: [4, 1],
    type: "tree",
    rarity: "common",
    description: "4dmg against objects which are located on an adjacent tile",
  },
  spruce: {
    name: "spruce",
    hp: 4,
    pts: 2,
    dmg: 2,
    type: "tree",
    rarity: "common",
    description: "Not a too big tree",
  },
  willow: {
    name: "willow",
    hp: 17,
    pts: 8,
    dmg: 5,
    type: "tree",
    rarity: "common",
    description: "A voluminous tree",
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
  healObject,
  checkDistance,
  checkAnyEnemies,
  checkOpponentsMainTree,
  checkAttacksLeft,
  manageTime,
  handleTimeout,
};
