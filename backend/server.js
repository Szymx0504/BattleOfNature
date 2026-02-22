const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");

const {
  cardProperties,
  shuffleArray,
  generateGameId,
  adjustBoard,
  adjustVector,
  handleTimeout,
} = require("./utilities.js");

const Game = require('./src/game/core/Game');
const GameAPI = require('./src/game/core/GameAPI');

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

const activeGames = new Map();
const waitingPlayers = []; // {id, deck}
const playersOnline = new Map();

app.get("/api/players", (req, res) => {
  res.json({
    playersOnline: playersOnline.size,
    activeGames: activeGames.size,
  });
});

app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get(/.*/, (req, res, next) => {
  if (req.url.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

server.listen(8080, () => {
  console.log("server is on: ", Date().toLocaleLowerCase());
});

io.on("connection", (socket) => {
  const playerConnectionId = socket.id;
  playersOnline.set(socket.id, { joinedAt: Date.now() });

  socket.on("findOpponent", (deck) => {
    const counters = { legendary: 0, rare: 0, common: 0 };
    let repeat = false;
    const cardCount = {};
    for (let i = 0; i < deck.length; i++) {
      const card = deck[i];
      const rarity = cardProperties[card]?.rarity;
      if (rarity) counters[rarity] = (counters[rarity] || 0) + 1;
      
      cardCount[card] = (cardCount[card] || 0) + 1;
      if (cardCount[card] > 1) repeat = true;
    }

    if (deck.length === 15 && counters.legendary <= 1 && counters.rare <= 5 && !repeat) {
      if (waitingPlayers.length) {
        const { enemyId, enemyDeck } = waitingPlayers[0];
        waitingPlayers.shift();

        const gameId = `${playerConnectionId}-${enemyId}`;
        const starts = Math.round(Math.random());
        shuffleArray(deck);
        shuffleArray(enemyDeck);

        const game = new Game(gameId, playerConnectionId, deck, enemyId, enemyDeck, starts);
        activeGames.set(gameId, game);

        const maxWaitTime = (30 + game.players[game.whoseMove].globalTime) * 1000;
        game.forceEndTimer = setTimeout(() => {
          handleTimeout(game, game.whoseMove, game.getOpponentId(game.whoseMove), io, activeGames, gameId);
        }, maxWaitTime);

        // Emit opponentFound
        const exportedGame = game.exportGame();
        const exportedBoard = game.exportBoard();
        
        const getPlayersPayload = (targetPlayerId) => {
           const p1 = game.players[targetPlayerId];
           const p2 = game.players[game.getOpponentId(targetPlayerId)];
           return {
              [p1.id]: { hand: p1.hand, pts: p1.pts, passed: p1.passed, mainTree: p1.mainTree, globalTime: p1.globalTime },
              [p2.id]: { pts: p2.pts, passed: p2.passed, mainTree: p2.mainTree, globalTime: p2.globalTime }
           };
        };

        const publicGameP1 = { ...exportedGame, players: getPlayersPayload(playerConnectionId), board: adjustBoard(exportedBoard, false) };
        const publicGameP2 = { ...exportedGame, players: getPlayersPayload(enemyId), board: adjustBoard(exportedBoard, true) };

        socket.emit("opponentFound", gameId, publicGameP1);
        io.to(enemyId).emit("opponentFound", gameId, publicGameP2);
      } else {
        waitingPlayers.push({ enemyId: playerConnectionId, enemyDeck: deck });
      }
    } else {
      socket.emit("error", "Invalid deck - cannot find opponent");
    }
  });

  socket.on("playCard", (card, tile, special) => {
    const gameId = Array.from(activeGames.keys()).find((id) => id.includes(socket.id));
    if (!gameId) return socket.emit("error", "Game not found");
    const game = activeGames.get(gameId);

    const isRotate = !gameId.startsWith(playerConnectionId);
    
    // We expect tile = {row, col}
    const result = GameAPI.validateAndPlayCard(game, playerConnectionId, card, tile?.row, tile?.col, special, isRotate);
    if (result.timeout) return handleTimeout(game, playerConnectionId, game.getOpponentId(playerConnectionId), io, activeGames, gameId);
    if (result.error) return socket.emit("error", result.error);

    emitGameStateUpdate(io, socket, game, gameId, playerConnectionId, result.history, false);
  });

  socket.on("makeAttack", (sourceCardInfo, targetCardInfo) => {
    const gameId = Array.from(activeGames.keys()).find((id) => id.includes(socket.id));
    if (!gameId) return socket.emit("error", "Game not found");
    const game = activeGames.get(gameId);

    const isRotate = !gameId.startsWith(playerConnectionId);
    
    const result = GameAPI.validateAndAttack(game, playerConnectionId, sourceCardInfo, targetCardInfo, isRotate);
    if (result.timeout) return handleTimeout(game, playerConnectionId, game.getOpponentId(playerConnectionId), io, activeGames, gameId);
    if (result.error) return socket.emit("error", result.error);

    emitGameStateUpdate(io, socket, game, gameId, playerConnectionId, result.history, false);
    
    if (result.winner) activeGames.delete(gameId);
  });

  socket.on("passTurn", () => {
    const gameId = Array.from(activeGames.keys()).find((id) => id.includes(socket.id));
    if (!gameId) return socket.emit("error", "Game not found");
    const game = activeGames.get(gameId);
    
    const isRotate = !gameId.startsWith(playerConnectionId);
    const enemyId = game.getOpponentId(playerConnectionId);

    const result = GameAPI.passTurn(game, playerConnectionId, isRotate);
    if (result.timeout) return handleTimeout(game, playerConnectionId, enemyId, io, activeGames, gameId);
    if (result.error) return socket.emit("error", result.error);

    if (result.newTurn) {
       if (game.turnNumber > 15) {
           io.to(enemyId).emit("draw");
           socket.emit("draw");
           activeGames.delete(gameId);
           return;
       }
       emitGameStateUpdate(io, socket, game, gameId, playerConnectionId, result.history, true);
    } else {
       if (game.forceEndTimer) clearTimeout(game.forceEndTimer);
       
       game.actionStartedAt = Date.now();
       const maxWaitTime = (30 + game.players[game.whoseMove].globalTime) * 1000;
       
       game.forceEndTimer = setTimeout(() => {
           handleTimeout(game, game.whoseMove, game.getOpponentId(game.whoseMove), io, activeGames, gameId);
       }, maxWaitTime);

       const passedData = {
           [playerConnectionId]: { passed: game.players[playerConnectionId].passed, globalTime: game.players[playerConnectionId].globalTime },
           [enemyId]: { passed: game.players[enemyId].passed, globalTime: game.players[enemyId].globalTime },
           whoseMove: game.whoseMove,
           actionStartedAt: game.actionStartedAt
       };

       socket.emit("passedTurn", passedData, result.history);
       io.to(enemyId).emit("passedTurn", passedData, result.history, true);
    }
  });

  socket.on("disconnect", (reason) => {
    const gameId = Array.from(activeGames.keys()).find((id) => id.includes(socket.id));
    if (gameId) {
      const opponentId = Object.keys(activeGames.get(gameId).players).find((id) => id !== socket.id);
      io.to(opponentId).emit("opponentLeft");
      activeGames.delete(gameId);
    }
    const index = waitingPlayers.findIndex((player) => player.enemyId === socket.id);
    if (index !== -1) waitingPlayers.splice(index, 1);
    playersOnline.delete(socket.id);
  });
});

function emitGameStateUpdate(io, socket, game, gameId, playerConnectionId, history, isNewTurn) {
  const enemyId = game.getOpponentId(playerConnectionId);
  const isRotate = !gameId.startsWith(playerConnectionId);

  game.actionStartedAt = Date.now();

  if (game.forceEndTimer) clearTimeout(game.forceEndTimer);
  const maxWaitTime = (30 + game.players[game.whoseMove].globalTime) * 1000;
  game.forceEndTimer = setTimeout(() => {
      handleTimeout(game, game.whoseMove, game.getOpponentId(game.whoseMove), io, activeGames, gameId);
  }, maxWaitTime);

  const exportedGame = game.exportGame();
  const exportedBoard = game.exportBoard();
  
  const getPlayersPayload = (targetPlayerId) => {
     const p1 = game.players[targetPlayerId];
     const p2 = game.players[game.getOpponentId(targetPlayerId)];
     return {
        [p1.id]: { hand: p1.hand, pts: p1.pts, passed: p1.passed, mainTree: p1.mainTree, globalTime: p1.globalTime },
        [p2.id]: { pts: p2.pts, passed: p2.passed, mainTree: p2.mainTree, globalTime: p2.globalTime }
     };
  };

  const publicGameP1 = { ...exportedGame, players: getPlayersPayload(playerConnectionId), board: adjustBoard(exportedBoard, isRotate) };
  const publicGameP2 = { ...exportedGame, players: getPlayersPayload(enemyId), board: adjustBoard(exportedBoard, !isRotate) };

  const historyP1 = adjustVector(history, isRotate);
  const historyP2 = adjustVector(history, !isRotate);

  const extraP1 = isNewTurn ? { newTurn: game.turnNumber } : { winner: game.winner };
  const extraP2 = isNewTurn ? { newTurn: game.turnNumber } : { winner: game.winner, enemyPlayed: !game.players[enemyId].passed };

  socket.emit("update", publicGameP1, historyP1, extraP1);
  io.to(enemyId).emit("update", publicGameP2, historyP2, extraP2);
}
