import { useParams, useLocation } from "react-router-dom";
import { useState } from "react";

import { useSocket } from "../hooks/useSocket";

import Board from "../components/Arena/Board";
import Hand from "../components/Arena/Hand";

import { cardProperties } from "../assets/cardProperties";

const board = [
  [{}, { mainTree: true }, {}],
  [{ inactive: true }, {}, {}, {}, { inactive: true }],
  [{ inactive: true }, {}, {}, {}, { inactive: true }],
  [{}, { mainTree: true }, {}],
];
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < board[i].length; j++) {
    board[i][j].cards = [];
  }
}

const Arena = () => {
  const gid = useParams().gid;
  const {
    isConnected,
    gameState,
    socketId,
    findOpponent,
    playCard,
    makeAttack,
    passTurn,
  } = useSocket();
  // const location = useLocation();
  // const {initialHand, initialPts} = location.state || {};
  const [selectedCard, setSelectedCard] = useState(null);
  // think about selecting card on hand vS on board. and reseting if tile clicked

  const handleTileClick = (tile, rowIndex, colIndex) => {
    // genius!
    // if (selectedCard) {

    // add: if you have card picked on your hand and click other card on a board: it updates DONE
    // add: if you have card picked on your board and click other card on a board that belongs to you: it updates DONE
    // add: clicking on opponent's card to see additional info
    // add: unselecting a card if clicked 2nd time or an invalid operation occured or clicked outside of the board DONE/2 (not about clicking outside the board)
    if (selectedCard?.hand) {
      // w hand są tylko twoje karty - no need to check if it's yours
      if (tile.cards.length > 0) {
        setSelectedCard({
          ...tile.cards[0],
          hand: false,
          row: rowIndex,
          col: colIndex,
        }); // adjust when adding multiple cards per tile (possible to select opponent's one)
        return;
      }
      if (tile.owner !== socketId) {
        // adjust for special cards in the future
        console.log("the tile is not yours!");
      } else if (
        gameState?.players[socketId].pts < cardProperties[selectedCard.name].pts
      ) {
        console.log("not enough points!!!");
      } else if (gameState?.whoseMove !== socketId) {
        console.log("not your turn!");
      } else {
        playCard(selectedCard.name, { row: rowIndex, col: colIndex });
      }
      setSelectedCard(null);
    } else if (selectedCard?.hand === false) {
      // selected card on board
      // maybe extract it and base your decisions on it (?) having implemented correct order of "card vulnerability" + both players never have a card on the same tile assumptions

      // opponent's card
      const opponentCard = tile.cards.find((card) => card.owner !== socketId);
      // selected card may be opponent's card!
      if (opponentCard && selectedCard.owner === socketId) {
        if (gameState?.whoseMove !== socketId) {
          console.log("not your turn!");
        } else {
          makeAttack(
            {
              row: selectedCard.row,
              col: selectedCard.col,
              name: selectedCard.name,
            },
            {
              row: rowIndex,
              col: colIndex,
              name: opponentCard.name,
            }
          );
        }

        setSelectedCard(null);
        return; // assumption: both players never have a card on the same tile
      }
      // const thisCard = tile.cards.find(card => card.name === selectedCard.name && card.owner === socketId);
      const thisCard = tile.cards.find(
        (card) =>
          card.name === selectedCard.name && card.owner === selectedCard.owner
      ); // opponent's card friendly
      if (thisCard) {
        setSelectedCard(null);
        return;
      }
      if (tile.cards.length > 0) {
        setSelectedCard({
          ...tile.cards[0],
          hand: false,
          row: rowIndex,
          col: colIndex,
        }); // adjust when adding multiple cards per tile (possible to select opponent's one)
      }
    } else {
      // no card selected yet, click on a board
      // const clickedCard = tile.cards.find((card) => card.owner === socketId); //  && card.hasAttack - maybe not (?) - upgrading or for info
      if (tile.cards.length > 0) {
        const clickedCard = tile.cards[0]; // adjust when adding multiple cards per tile (possible to select opponent's one)
        console.log({ ...clickedCard, hand: false });
        setSelectedCard({
          ...clickedCard,
          hand: false,
          row: rowIndex,
          col: colIndex,
        });
      }
    }
  };

  const handlePass = () => {
    if(gameState?.whoseMove !== socketId){
      console.log("not your turn!");
      return; // you could add it do disabled in <button>, idk
    }
    passTurn();
  };

  return (
    <div>
      <div>
        <p>Turn {gameState?.turnNumber}</p>
        <p>
          {gameState?.whoseMove === socketId ? "Your move" : "Opponent's move"}
        </p>
        <p>You currently have {gameState?.players[socketId].pts}pts</p>
        <button
          disabled={gameState?.players[socketId].passed}
          onClick={handlePass}
        >
          Pass turn
        </button>
        <p>
          Opponent{" "}
          {gameState?.players[
            Object.keys(gameState?.players).find((id) => id !== socketId)
          ].passed
            ? "passed turn"
            : "still plays"}
        </p>
      </div>
      <Board
        board={gameState?.board}
        onTileClick={handleTileClick}
        selectedCard={selectedCard}
      />
      <Hand
        hand={gameState?.players[socketId].hand}
        selectedCard={selectedCard}
        onCardClick={setSelectedCard}
        socketId={socketId}
      />
    </div>
  );
};

export default Arena;
