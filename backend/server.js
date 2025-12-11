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
  adjustCords,
  getColGeometrically,
  cardTypes,
  adjustVector,
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

    // modify it in the future to accept different kinds of cards, for now - only a specific-tile cards allowed
    if (tile?.row == undefined || tile?.col == undefined) {
      socket.emit("error", "Invalid input - undefined tile");
      return;
    }
    const rotate = !gameId.startsWith(playerConnectionId);
    const { row, col } = adjustCords(tile.row, tile.col, rotate);
    const colGeo = getColGeometrically(row, col);
    // if(tile.row < 0 || tile.row > 3|| tile.col < 0 || tile.col > 2 || Math.abs(1.5 - tile.row) + Math.abs(1 - tile.col) > 2) // think about it when ground will be added
    // cols <1, 3> - already accounted for the ground presence!
    if (row < 0 || row > 3 || colGeo < 1 || colGeo > 3) {
      socket.emit("error", "No such tile exists");
      return;
    }
    if (game.players[playerConnectionId].pts < cardProperties[card].pts) {
      socket.emit("error", "Not enough points to play this card");
      return;
    }
    const changesVector = [];
    const enemyId = Object.keys(game.players).find(
      (id) => id !== playerConnectionId
    );

    if (cardProperties[card].type !== "spell") {
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

      changesVector.push({
        action: "place",
        row,
        col,
        owner: playerConnectionId,
        name: card,
      });

      game.board[row][col].cards.push({
        ...cardProperties[card],
        hasAttack: true,
        owner: playerConnectionId,
      });
    } else {
      if (
        !game.board[row][col].cards.find((card) => card.owner === enemyId) ||
        (card === "medicinal herbs" && // "good" cards
          !game.board[row][col].cards.find(
            (card) => card.owner === playerConnectionId
          ))
      ) {
        // account for multiple cards on 1 tile in the future
        socket.emit("error", "No valid target");
        return;
      }

      changesVector.push({
        action: "played",
        row,
        col,
        owner: playerConnectionId,
        name: card,
      });

      // account for multiple cards per tile
      const targetCard = game.board[row][col].cards[0];
      // rozwaz potem wybieranie kolejnosci dodawania do cycle/narzuc jakas idk
      game.players[playerConnectionId].cycle.push(targetCard.name);


      // IMPORTANT do funcs dealDamage and heal that will take care of consequences - like dying, healing up to +1 etc
      if (card !== "medicinal herbs") {
        targetCard.hp -= cardProperties[card].dmg;
        if (targetCard.hp <= 0) {
          // account for multiple cards per tile
          game.board[row][col].cards.splice(0, 1);
          game.players[enemyId].cycle.push(targetCard.name);
        }
        changesVector.push({
          action: targetCard.hp <= 0 ? "death" : "damageTaken",
          row,
          col,
          owner: enemyId,
          name: targetCard.name,
          ...(targetCard.hp > 0 ? { value: cardProperties[card].dmg } : {}),
          by: card
        });
      } else {
        const newHp = min(
          cardProperties[targetCard.name].hp + 1,
          targetCard.hp + cardProperties[card].hp
        );
        const healValue = newHp - targetCard.hp;
        targetCard.hp = newHp;
        changesVector.push({
          action: "heal",
          row,
          col,
          owner: playerConnectionId,
          name: targetCard.name,
          value: healValue,
          by: card
        });
      }
    }

    // game.board[row][col].cards.push({name: card, hasAttack: false});
    // everything except for rarity
    // game.board[row][col].cards.push({
    //   ...(({ rarity, ...rest }) => rest)(cardProperties[card]),
    //   hasAttack: true,
    //   owner: playerConnectionId,
    // });
    // filtering not in-place
    game.players[playerConnectionId].hand = game.players[
      playerConnectionId
    ].hand.filter((cardName) => cardName !== card);
    game.players[playerConnectionId].pts -= cardProperties[card].pts;
    // check if passed - separate func for that
    // also return whoStartedTurn at the begigning of the game
    // game.whoseMove = enemyId;
    if (!game.players[enemyId].passed) {
      game.whoseMove = enemyId;
    }
    // there will be different actions: "place", "death" etc etc of things that may happen in a "chain reaction"
    // then the frontend will simulate it and compare it with the final game state sent
    // maybe even in the future it will only receive changesVector and not the whole game's state (not for now)
    // IMPORTANT: you need to adjust all changesVector's coords for a player "at the top"!! do it while emitting a socket

    io.to(enemyId).emit(
      "update",
      {
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
      },
      adjustVector(changesVector, !rotate)
    );
    socket.emit(
      "update",
      {
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
      },
      adjustVector(changesVector, rotate)
    );
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

    if (
      sourceCardInfo?.row === undefined ||
      sourceCardInfo?.col === undefined ||
      targetCardInfo?.row === undefined ||
      targetCardInfo?.col === undefined
    ) {
      socket.emit("error", "Coords must not be undefined");
      return;
    }
    if (
      !Object.keys(cardProperties).includes(sourceCardInfo?.name) ||
      !Object.keys(cardProperties).includes(targetCardInfo?.name)
    ) {
      socket.emit("error", "A given card does not exist");
      return;
    }
    // // you need to translate coords if the attacker is the player at the top!
    const rotate = !gameId.startsWith(playerConnectionId);
    const { row: sourceRow, col: sourceCol } = adjustCords(
      sourceCardInfo.row,
      sourceCardInfo.col,
      rotate
    );
    const { row: targetRow, col: targetCol } = adjustCords(
      targetCardInfo.row,
      targetCardInfo.col,
      rotate
    );
    const sourceColGeo = getColGeometrically(sourceRow, sourceCol);
    const targetColGeo = getColGeometrically(targetRow, targetCol);

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
      (card) =>
        card.name === sourceCardInfo.name && card.owner === playerConnectionId
    );
    const targetCard = game.board[targetRow][targetCol].cards.find(
      (card) => card.name === targetCardInfo.name && card.owner === enemyId
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

    const changesVector = [];

    // simple attack for now
    targetCard.hp -= sourceCard.dmg; // will update, reference
    if (targetCard.hp <= 0) {
      game.board[targetRow][targetCol].cards.splice(
        game.board[targetRow][targetCol].cards.indexOf(targetCard),
        1
      );
      game.players[enemyId].cycle.push(targetCard.name);
    }
    changesVector.push({
      action: targetCard.hp <= 0 ? "death" : "damageTaken",
      row: targetRow,
      col: targetCol,
      owner: enemyId,
      name: targetCardInfo.name,
      ...(targetCard.hp > 0 ? { value: sourceCard.dmg } : {}),
      by: sourceCard.name
    });

    // add dying functionality later on
    sourceCard.hasAttack = false;
    // check if passed - separate func for that
    // also return whoStartedTurn at the begigning of the game
    // game.whoseMove = enemyId;
    if (!game.players[enemyId].passed) {
      game.whoseMove = enemyId;
    }

    io.to(enemyId).emit(
      "update",
      {
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
      },
      adjustVector(changesVector, !rotate)
    );
    socket.emit(
      "update",
      {
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
      },
      adjustVector(changesVector, rotate)
    );
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
      console.log("here");
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
      const changesVector = [{ action: "newTurn" }];
      // decide who's starting !whoStartedTurn
      if (game.turnNumber !== 0) {
        // after first turn, the same person begins
        game.whoStartedTurn = Object.keys(game.players).find(
          (id) => id !== game.whoStartedTurn
        );
      }
      game.whoseMove = game.whoStartedTurn;
      game.turnNumber++;
      if (game.turnNumber <= 12) {
        game.players[playerConnectionId].pts = 10;
        game.players[enemyId].pts = 10;
      } else {
        game.players[playerConnectionId].pts = 15;
        game.players[enemyId].pts = 15;
      }
      game.players[playerConnectionId].passed = false;
      game.players[enemyId].passed = false;
      for (let i = 0; i < game.board.length; i++) {
        for (let j = 0; j < game.board[i].length; j++) {
          for (const card of game.board[i][j].cards) {
            card.hasAttack = true;
          }
        }
      }
      while (
        game.players[playerConnectionId].hand.length < 5 &&
        game.players[playerConnectionId].cycle.length > 0
      ) {
        game.players[playerConnectionId].hand.push(
          game.players[playerConnectionId].cycle[0]
        );
        game.players[playerConnectionId].cycle.shift();
      }
      while (
        game.players[enemyId].hand.length < 5 &&
        game.players[enemyId].cycle.length > 0
      ) {
        game.players[enemyId].hand.push(game.players[enemyId].cycle[0]);
        game.players[enemyId].cycle.shift();
      }
      // all effects resets etc etc as new cards get added
      const rotate = !gameId.startsWith(playerConnectionId);
      io.to(enemyId).emit(
        "update",
        {
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
        },
        adjustVector(changesVector, !rotate)
      );
      socket.emit(
        "update",
        {
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
        },
        adjustVector(changesVector, rotate)
      );
    } else {
      game.whoseMove = enemyId;
      // continue this turn... (only passed changes)
      const changesVector = [{ action: "passed", by: playerConnectionId }];
      // if more complicated mechanics in the future, just emit a general "emit" with the whole board (except for hidden data like cycles, opponent's hand)
      io.to(enemyId).emit(
        "passedTurn",
        {
          [playerConnectionId]: game.players[playerConnectionId].passed,
          [enemyId]: game.players[enemyId].passed,
          whoseMove: game.whoseMove,
        },
        changesVector
      );
      socket.emit(
        "passedTurn",
        {
          [playerConnectionId]: game.players[playerConnectionId].passed,
          [enemyId]: game.players[enemyId].passed,
          whoseMove: game.whoseMove,
        },
        changesVector
      );
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
