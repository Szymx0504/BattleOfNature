import { useParams, useLocation } from "react-router-dom";
import { useState } from "react";

import { useSocket } from "../hooks/useSocket";

import Board from "../components/Arena/Board";
import Hand from "../components/Arena/Hand";

import { cardProperties } from "../assets/cardProperties";
import classes from "./Arena.module.css";
import PtsBar from "../components/Arena/PtsBar";
import ActionsLog from "../components/Arena/ActionsLog";

function getColGeometrically(row, col) {
  return row == 0 || row == 3 ? col + 1 : col;
}

function checkDistance(sourceRow, sourceCol, targetRow, targetCol, diagonally) {
  const rowDist = Math.abs(sourceRow - targetRow);
  const colDist = Math.abs(sourceCol - targetCol);
  return diagonally ? Math.max(rowDist, colDist) : rowDist + colDist;
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
    changesVector,
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
      if (tile.cards.length > 0 && selectedCard?.type !== "spell") {
        setSelectedCard({
          ...tile.cards[0],
          hand: false,
          row: rowIndex,
          col: colIndex,
        }); // adjust when adding multiple cards per tile (possible to select opponent's one)
        return;
      }
      if (
        selectedCard?.type === "spell" &&
        tile.cards.filter(
          (card) =>
            card.owner ===
            (selectedCard?.name === "medicinal herbs"
              ? socketId
              : Object.keys(gameState?.players).find((id) => id !== socketId))
        ).length === 0
      ) {
        setSelectedCard(null);
        return;
      }

      // card specific checks
      if(selectedCard?.name === "bark beetles" && !tile.cards.find(card => card.type === "tree")){
        console.log("no tree to attack");
        setSelectedCard(null);
        return;
      }
      if(selectedCard?.name === "creepers" && (rowIndex !== 0 || colIndex !== 1)){
        console.log("creepers must be placed on opponent's Main Tree");
        setSelectedCard(null);
        return;
      }

      if (tile.owner !== socketId && selectedCard?.type !== "spell" && selectedCard?.name !== "creepers") {
        // adjust for special cards in the future
        console.log(selectedCard);
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

      // spells cannot be on board so no check needed (?) think about it

      // somehow to pick a main tree--

      // opponent's card
      const opponentCard = tile.cards.find((card) => card.owner !== socketId);
      // selected card may be opponent's card!
      if (opponentCard && selectedCard.owner === socketId) {
        if (gameState?.whoseMove !== socketId) {
          console.log("not your turn!");
        } else if (
          selectedCard.name === "chopper" &&
          checkDistance(
            selectedCard.row,
            getColGeometrically(selectedCard.row, selectedCard.col),
            rowIndex,
            getColGeometrically(rowIndex, colIndex),
            true
          ) > 1
        ) {
          console.log("invalid range");
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
    if (gameState?.whoseMove !== socketId) {
      console.log("not your turn!");
      return; // you could add it do disabled in <button>, idk
    }
    for (const row of gameState?.board) {
      for (const tile of row) {
        for (const card of tile.cards) {
          if (card.hasAttack && card.owner === socketId) {
            console.log("some cards still have an attack to be performed");
            return;
          }
        }
      }
    }
    passTurn();
  };

  return (
    <div className={classes.gameWrapper}>
      <div className={classes.info}>
        <p>Turn {gameState?.turnNumber}</p>
        <p>
          {gameState?.whoseMove === socketId ? "Your move" : "Opponent's move"}
        </p>
        {/* <p>You currently have {gameState?.players[socketId].pts}pts</p> */}
        <button
          className={classes.passBtn}
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
      <div className={classes.boardArea}>
        <Board
          board={gameState?.board}
          onTileClick={handleTileClick}
          selectedCard={selectedCard}
          socketId={socketId}
          params={gameState?.params}
        />
        <ActionsLog changesVector={changesVector} socketId={socketId} />
      </div>
      <div className={classes.table}>
        <Hand
          hand={gameState?.players[socketId].hand}
          selectedCard={selectedCard}
          onCardClick={setSelectedCard}
          socketId={socketId}
        />
        <PtsBar curPts={gameState?.players[socketId].pts} />
      </div>
    </div>
  );
};

export default Arena;
