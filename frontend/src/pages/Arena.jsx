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
  } = useSocket();
  // const location = useLocation();
  // const {initialHand, initialPts} = location.state || {};
  const [selectedCard, setSelectedCard] = useState(null);
  // think about selecting card on hand vS on board. and reseting if tile clicked

  const handleTileClick = (tile, rowIndex, colIndex) => {
    // genius!
    // if (selectedCard) {

    // add: if you have card picked on your hand and click other card on a board: it updates
    // add: if you have card picked on your board and click other card on a board that belongs to you: it updates
    // add: clicking on opponent's card to see additional info
    // add: unselecting a card if clicked 2nd time or an invalid operation occured or clicked outside of the board
    console.log("check", selectedCard?.hand, selectedCard)
    if (selectedCard?.hand) {
      // add other criteria along the way
      if (tile.owner !== socketId) {
        // adjust for special cards in the future
        console.log("the tile is not yours!");
      } else if (
        gameState?.players[socketId].pts < cardProperties[selectedCard.name].pts
      ) {
        console.log("not enough points!!!");
      } else {
        playCard(selectedCard.name, { row: rowIndex, col: colIndex });
      }
      setSelectedCard(null);
    } else if (selectedCard?.hand === false) {
        console.log("here")
      // selected card on board
      // maybe extract it and base your decisions on it (?) having implemented correct order of "card vulnerability" + both players never have a card on the same tile assumptions
      const clickedCard = tile.cards.find((card) => card.owner !== socketId);
      if (clickedCard) {
        makeAttack(
          {
            sourceRow: selectedCard.row,
            sourceCol: selectedCard.col,
            sourceName: selectedCard.name
          },
          {
            targetRow: rowIndex,
            targetCol: colIndex,
            targetName: clickedCard.name,
          }
        );
        setSelectedCard(null);
      }
    } else {
      // no card selected yet, click on a board
      const clickedCard = tile.cards.find((card) => card.owner === socketId); //  && card.hasAttack - maybe not (?) - upgrading or for info
      if (clickedCard) {
        console.log({ ...clickedCard, hand: false });
        setSelectedCard({ ...clickedCard, hand: false, row: rowIndex, col: colIndex });
      }
    }
  };
  return (
    <div>
      <div>
        <p>Turn 0</p>
        <p>
          {gameState?.whoseMove === socketId ? "Your move" : "Opponent's move"}
        </p>
        <p>You currently have {gameState?.players[socketId].pts}pts</p>
      </div>
      <Board board={gameState?.board} onTileClick={handleTileClick} />
      <Hand
        hand={gameState?.players[socketId].hand}
        selectedCard={selectedCard}
        onCardClick={setSelectedCard}
      />
    </div>
  );
};

export default Arena;
