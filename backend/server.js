const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const {
  cardProperties,
  shuffleArray,
  generateGameId,
  generateBoard,
  updateWhoseMove,
  adjustBoard,
} = require("./temporary.js");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // origin: "*"
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Store active games (use Redis in production)
const activeGames = new Map();
const waitingPlayers = []; // {id, deck}

app.get("/api/test", (req, res) => {
  res.json({ status: "Backend" });
});

app.post("/api/create-game", (req, res) => {
  const gameId = generateGameId();
  activeGames.set(gameId, { newGame: 5 });
  res.json({ gameId });
});

server.listen(8080, () => {
  console.log("server is on: ", Date().toLocaleLowerCase());
});

io.on("connection", (socket) => {
  const playerConnectionId = socket.id; // real id from connection

  socket.on("findOpponent", (deck) => {
    const counters = { legendary: 0, rare: 0, common: 0 };
    let repeat = false;
    const cardCount = {};
    for (let i = 0; i < deck.length; i++) {
      const card = deck[i];
      const rarity = cardProperties[card]?.rarity;
      if (rarity) {
        counters[rarity] = (counters[rarity] || 0) + 1;
      }
      // Check for duplicates
      cardCount[card] = (cardCount[card] || 0) + 1;
      if (cardCount[card] > 1) {
        repeat = true;
      }
    }

    if (
      deck.length === 15 &&
      counters.legendary <= 1 &&
      counters.rare <= 5 &&
      !repeat
    ) {
      if (waitingPlayers.length) {
        const { enemyId, enemyDeck } = waitingPlayers[0];
        waitingPlayers.shift();

        const gameId = `${playerConnectionId}-${enemyId}`;
        const starts = Math.round(Math.random());
        shuffleArray(deck);
        shuffleArray(enemyDeck);

        const game = {
          players: {
            [playerConnectionId]: {
              deck, // may be redundant
              hand: deck.slice(0, 5),
              cycle: deck.slice(-10),
              pts: 5,
              passed: false,
            },
            [enemyId]: {
              deck: enemyDeck,
              hand: enemyDeck.slice(0, 5),
              cycle: enemyDeck.slice(-10),
              pts: 5,
              passed: false,
            },
          },
          board: generateBoard(playerConnectionId, enemyId),
          whoseMove: starts ? playerConnectionId : enemyId,
          whoStartedTurn: starts ? playerConnectionId : enemyId,
          turnNumber: 0,
          params: {
            [playerConnectionId + "MainTreeHp"]: 25,
            [enemyId + "MainTreeHp"]: 25,
          },
          spellDurations: {},
          diedThisMove: {
            [playerConnectionId]: [],
            [enemyId]: [],
          },
          attacksThisMove: [],
        };
        activeGames.set(gameId, game);

        // all game data will be sent here (# of turns etc.)

        // repack it in a minute (rotate board, restrict deck visibitily etc, rotate in playCard)
        // const rotate = !gameId.startsWith(playerConnectionId); // we create the gameId here: `${playerConnectionId}-${enemyId}`, so rotate for opponent

        io.to(enemyId).emit("opponentFound", gameId, {
          ...game,
          players: {
            [enemyId]: {
              hand: game.players[enemyId].hand,
              pts: game.players[enemyId].pts,
              passed: game.players[enemyId].passed,
            },
            [playerConnectionId]: {
              pts: game.players[playerConnectionId].pts,
              passed: game.players[playerConnectionId].passed,
            },
          },
          board: adjustBoard(game.board, true),
        });
        socket.emit("opponentFound", gameId, {
          ...game,
          players: {
            [playerConnectionId]: {
              hand: game.players[playerConnectionId].hand,
              pts: game.players[playerConnectionId].pts,
              passed: game.players[playerConnectionId].passed,
            },
            [enemyId]: {
              pts: game.players[enemyId].pts,
              passed: game.players[enemyId].passed,
            },
          },
          board: adjustBoard(game.board, false), // could be ommited but maybe we'll add sth there in the future
        });
      } else {
        waitingPlayers.push({ enemyId: playerConnectionId, enemyDeck: deck });
        console.log("waiting...");
      }
    } else {
      socket.emit("error", "Invalid deck - cannot find opponent"); // WRONG DECK
    }
  });

  socket.on("playCard", (card, tile) => {
    const gameId = Array.from(activeGames.keys()).find((id) =>
      id.includes(socket.id)
    );
    if (!gameId) {
      socket.emit("error", "Game not found");
      return;
    }
    const game = activeGames.get(gameId);
    if (game.whoseMove !== playerConnectionId) {
      socket.emit("error", "Not your turn");
      return;
    }
    if (!game.players[playerConnectionId].hand.includes(card)) {
      socket.emit("error", "You do not have that card in your hand");
      return; // no need to check it on the frontend. we check only "non-cheating" possibilities there, and here we check both (cheating and fair-play)
    }
    // is this check redundant? (looking at the above)
    if (!Object.keys(cardProperties).includes(card)) {
      socket.emit("error", "No such card exists");
      return;
    }

    // the board will always be stored "down"-firstPfromGameId
    // transform coords accordingly current user's perspective:
    let row = tile?.row;
    let col = tile?.col;
    const rotate = !gameId.startsWith(playerConnectionId);
    if (rotate) {
      if (row == 0 || row == 3) {
        col = 2 - col;
      } else {
        col = 4 - col;
      }
      row = 3 - row;
    }
    const colGeo = row == 0 || row == 3 ? col + 1 : col;
    // if(tile.row < 0 || tile.row > 3|| tile.col < 0 || tile.col > 2 || Math.abs(1.5 - tile.row) + Math.abs(1 - tile.col) > 2) // think about it when ground will be added
    // cols <1, 3> - already accounted for the ground presence!
    if (
      row === undefined ||
      col === undefined ||
      row < 0 ||
      row > 3 ||
      colGeo < 1 ||
      colGeo > 3
    ) {
      socket.emit("error", "No such tile exists");
      return;
    }
    if (game.board[row][col].owner !== playerConnectionId) {
      // adjust for special cards in the future
      socket.emit("error", "The tile does not belong to you");
      return;
    }
    if (game.board[row][col].cards.length > 0) {
      // also adjust this
      socket.emit("error", "Tile already occupied");
      return;
    }
    if (game.players[playerConnectionId].pts < cardProperties[card].pts) {
      socket.emit("error", "Not enough points to play this card");
      return;
    }

    // game.board[row][col].cards.push({name: card, hasAttack: false});
    // everything except for rarity
    game.board[row][col].cards.push({
      ...(({ rarity, ...rest }) => rest)(cardProperties[card]),
      hasAttack: true,
      owner: playerConnectionId,
    });
    // filtering not in-place
    game.players[playerConnectionId].hand = game.players[
      playerConnectionId
    ].hand.filter((cardName) => cardName !== card);
    game.players[playerConnectionId].pts -= cardProperties[card].pts;
    const enemyId = Object.keys(game.players).find(
      (id) => id !== playerConnectionId
    );
    // check if passed - separate func for that
    // also return whoStartedTurn at the begigning of the game
    // game.whoseMove = enemyId;
    if (!game.players[enemyId].passed) {
      game.whoseMove = enemyId;
    }

    io.to(enemyId).emit("update", {
      ...game,
      players: {
        [enemyId]: {
          hand: game.players[enemyId].hand,
          pts: game.players[enemyId].pts,
          passed: game.players[enemyId].passed,
        },
        [playerConnectionId]: {
          pts: game.players[playerConnectionId].pts,
          passed: game.players[playerConnectionId].passed,
        },
      },
      board: adjustBoard(game.board, !rotate),
    });
    socket.emit("update", {
      ...game,
      players: {
        [playerConnectionId]: {
          hand: game.players[playerConnectionId].hand,
          pts: game.players[playerConnectionId].pts,
          passed: game.players[playerConnectionId].passed,
        },
        [enemyId]: {
          pts: game.players[enemyId].pts,
          passed: game.players[enemyId].passed,
        },
      },
      board: adjustBoard(game.board, rotate),
    });
  });

  socket.on("makeAttack", (sourceCardInfo, targetCardInfo) => {
    const gameId = Array.from(activeGames.keys()).find((id) =>
      id.includes(socket.id)
    );
    if (!gameId) {
      socket.emit("error", "Game not found");
      return;
    }
    const game = activeGames.get(gameId);
    if (game.whoseMove !== playerConnectionId) {
      socket.emit("error", "Not your turn");
      return;
    }

    let { sourceRow, sourceCol, sourceName } = sourceCardInfo;
    let { targetRow, targetCol, targetName } = targetCardInfo;
    // // you need to translate coords if the attacker is the player at the top!
    const rotate = !gameId.startsWith(playerConnectionId);
    if (rotate) {
      if (sourceRow == 0 || sourceRow == 3) {
        sourceCol = 2 - sourceCol;
      } else {
        sourceCol = 4 - sourceCol;
      }
      sourceRow = 3 - sourceRow;
      if (targetRow == 0 || targetRow == 3) {
        targetCol = 2 - targetCol;
      } else {
        targetCol = 4 - targetCol;
      }
      targetRow = 3 - targetRow;
    }
    const sourceColGeo =
      sourceRow == 0 || sourceRow == 3 ? sourceCol + 1 : sourceCol;
    const targetColGeo =
      targetRow == 0 || targetRow == 3 ? targetCol + 1 : targetCol;

    if (
      sourceRow < 0 ||
      sourceRow > 3 ||
      sourceColGeo < 1 ||
      sourceColGeo > 3 ||
      targetRow < 0 ||
      targetRow > 3 ||
      targetColGeo < 1 ||
      targetColGeo > 3
    ) {
      socket.emit("error", "Invalid coordinates");
      return;
    }

    const enemyId = Object.keys(game.players).find(
      (id) => id !== playerConnectionId
    );
    // ensure these are really player's and opponent's cards
    const sourceCard = game.board[sourceRow][sourceCol].cards.find(
      (card) => card.name === sourceName && card.owner === playerConnectionId
    );
    const targetCard = game.board[targetRow][targetCol].cards.find(
      (card) => card.name === targetName && card.owner === enemyId
    );

    if (!sourceCard || !targetCard) {
      socket.emit("error", "Invalid cards chosen");
      return;
    }
    if (sourceCard.owner !== playerConnectionId) {
      socket.emit("error", "This card does not belong to you");
      return;
    }
    if (targetCard.owner === playerConnectionId) {
      socket.emit("error", "You must not attack your card");
      return;
    }
    if (!sourceCard.hasAttack) {
      socket.emit("error", "This card cannot attack now");
      return;
    }

    // simple attack for now
    targetCard.hp -= sourceCard.dmg; // will update, reference
    // add dying functionality later on
    sourceCard.hasAttack = false;
    // check if passed - separate func for that
    // also return whoStartedTurn at the begigning of the game
    // game.whoseMove = enemyId;
    if (!game.players[enemyId].passed) {
      game.whoseMove = enemyId;
    }

    io.to(enemyId).emit("update", {
      ...game,
      players: {
        [enemyId]: {
          hand: game.players[enemyId].hand,
          pts: game.players[enemyId].pts,
          passed: game.players[enemyId].passed,
        },
        [playerConnectionId]: {
          pts: game.players[playerConnectionId].pts,
          passed: game.players[playerConnectionId].passed,
        },
      },
      board: adjustBoard(game.board, !rotate),
    });
    socket.emit("update", {
      ...game,
      players: {
        [playerConnectionId]: {
          hand: game.players[playerConnectionId].hand,
          pts: game.players[playerConnectionId].pts,
          passed: game.players[playerConnectionId].passed,
        },
        [enemyId]: {
          pts: game.players[enemyId].pts,
          passed: game.players[enemyId].passed,
        },
      },
      board: adjustBoard(game.board, rotate),
    });
  });

  socket.on("passTurn", () => {
    const gameId = Array.from(activeGames.keys()).find((id) =>
      id.includes(socket.id)
    );
    if (!gameId) {
      socket.emit("error", "Game not found");
      return;
    }
    const game = activeGames.get(gameId);
    if (game.whoseMove !== playerConnectionId) {
      console.log("here")
      socket.emit("error", "Not your turn");
      return;
    }

    if (game.players[playerConnectionId].passed) {
      socket.emit("error", "You have already passed this turn!");
      return;
    }

    game.players[playerConnectionId].passed = true;

    // decide whether return new data via "update" (sending the whole board), or in an other way
    // update existing turn-changing functionality
    const enemyId = Object.keys(game.players).find(
      (id) => id !== playerConnectionId
    );
    if (game.players[enemyId].passed) {
      // new turn
      // decide who's starting !whoStartedTurn
      if (game.turnNumber !== 0) {
        // after first turn, the same person begins
        game.whoStartedTurn = !game.whoStartedTurn;
      }
      game.turnNumber++;
      if (game.turnNumber <= 12) {
        game.players[playerConnectionId].pts = 10;
        game.players[enemyId].pts = 10;
      } else {
        game.players[playerConnectionId].pts = 15;
        game.players[enemyId].pts = 15;
      }
      for (let i = 0; i < game.board.length; i++) {
        for (let j = 0; j < game.board[i].length; j++) {
          for (const card of game.board[i][j].cards) {
            card.hasAttack = true;
          }
        }
      }
      // all effects resets etc etc as new cards get added
      io.to(enemyId).emit("update", {
        ...game,
        players: {
          [enemyId]: {
            hand: game.players[enemyId].hand,
            pts: game.players[enemyId].pts,
            passed: game.players[enemyId].passed,
          },
          [playerConnectionId]: {
            pts: game.players[playerConnectionId].pts,
            passed: game.players[playerConnectionId].passed,
          },
        },
        board: adjustBoard(game.board, !rotate),
      });
      socket.emit("update", {
        ...game,
        players: {
          [playerConnectionId]: {
            hand: game.players[playerConnectionId].hand,
            pts: game.players[playerConnectionId].pts,
            passed: game.players[playerConnectionId].passed,
          },
          [enemyId]: {
            pts: game.players[enemyId].pts,
            passed: game.players[enemyId].passed,
          },
        },
        board: adjustBoard(game.board, rotate),
      });
    } else {
      game.whoseMove = enemyId;
      // continue this turn... (only passed changes)
      // if more complicated mechanics in the future, just emit a general "emit" with the whole board (except for hidden data like cycles, opponent's hand)
      io.to(enemyId).emit("passedTurn", {
        [playerConnectionId]: game.players[playerConnectionId].passed,
        [enemyId]: game.players[enemyId].passed,
        whoseMove: game.whoseMove,
      });
      socket.emit("passedTurn", {
        playerConnectionId: game.players[playerConnectionId].passed,
        enemyId: game.players[enemyId].passed,
        whoseMove: game.whoseMove,
      });
    }
  });

  socket.on("disconnect", (reason) => {
    const gameId = Array.from(activeGames.keys()).find((id) =>
      id.includes(socket.id)
    ); // ASSUMPTION NO SOCKET.ID REPEATS
    if (gameId) {
      const opponentId = Object.keys(activeGames.get(gameId).players).find(
        (id) => id !== socket.id
      );
      io.to(opponentId).emit("opponentLeft");
      activeGames.delete(gameId);
    }

    const index = waitingPlayers.findIndex(
      (player) => player.enemyId === socket.id
    );
    if (index !== -1) {
      // player was waiting
      waitingPlayers.splice(index, 1);
    }
  });
});
