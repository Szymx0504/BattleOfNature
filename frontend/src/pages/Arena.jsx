import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useSocket } from "../hooks/useSocket";

import Board from "../components/Arena/Board";
import Hand from "../components/Arena/Hand";

import { cardProperties } from "../assets/cardProperties";
import classes from "./Arena.module.css";
import PtsBar from "../components/Arena/PtsBar";
import ActionsLog from "../components/Arena/ActionsLog";
import Info from "../components/Arena/Info";

function getColGeometrically(row, col) {
  return row == 0 || row == 3 ? col + 1 : col;
}

function getColIndexWise(row, colGeo) {
  return row === 0 || row === 3 ? colGeo - 1 : colGeo;
}

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

function checkAnyEnemies(board, socketId, spell) {
  return board.some((row) =>
    row.some((tile) =>
      tile.cards.some(
        (card) =>
          card.owner !== socketId && (!spell || card.name !== "creepers")
      )
    )
  );
}

function checkOpponentsMainTree(row, col) {
  return row === 0 && col === 1;
}

function checkAttacksLeft(board, playerId) {
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
            const oppMainTreeRow = 0;
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

const Arena = () => {
  const gid = useParams().gid;
  const {
    isConnected,
    gameState,
    socketId,
    findOpponent,
    gameEnded,
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
    if (gameEnded) { // gameEnded + in 1 more place
      toast.warn("The game has already ended!");
      return;
    }
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
      const oppMainTree = checkOpponentsMainTree(rowIndex, colIndex);
      if (
        selectedCard?.type === "spell" &&
        // (rowIndex !== 0 || colIndex !== 1) &&
        !oppMainTree &&
        !tile.cards.find(
          (card) =>
            card.owner ===
            (selectedCard?.name === "medicinal herbs"
              ? socketId
              : Object.keys(gameState?.players).find((id) => id !== socketId))
        )
      ) {
        // assumption in if check: player cannot place anything on their main tree.
        setSelectedCard(null);
        return;
      }
      if (
        selectedCard?.type === "spell" &&
        oppMainTree &&
        selectedCard?.name !== "medicinal herbs" &&
        checkAnyEnemies(gameState?.board, socketId, true)
      ) {
        toast.warn("Cannot attack the Main Tree. There are enemies on board");
        // console.log("cannot attack main tree. Enemies on board");
        setSelectedCard(null);
        return;
      }

      // card specific checks
      if (
        selectedCard?.name === "bark beetles" &&
        !tile.cards.find((card) => card.type === "tree") &&
        !oppMainTree
      ) {
        toast.warn("There is no tree to attack here");
        // console.log("no tree to attack");
        setSelectedCard(null);
        return;
      }
      if (selectedCard?.name === "creepers" && !oppMainTree) {
        toast.warn("Creepers must be placed on the opponent's Main Tree");
        // console.log("creepers must be placed on opponent's Main Tree");
        setSelectedCard(null);
        return;
      }
      if (
        selectedCard?.type === "spell" &&
        tile.cards.find(
          (card) => card.name === "creepers" && card.owner !== socketId
        )
      ) {
        // possibly card.owner check here redundant, but doesn't hurt to leave it (maybe not to block YOUR creepers on the same tile with sth else (?))
        // account for multiple cards per tile (?) idk it may already be fine
        toast.warn("Creepers are resistant to spells");
        // console.log("creepers are resistant to speels");
        setSelectedCard(null);
        return;
      }

      if (
        tile.owner !== socketId &&
        selectedCard?.type !== "spell" &&
        selectedCard?.name !== "creepers"
      ) {
        // adjust for special cards in the future
        toast.warn("The tile doesn't belong to you");
        // console.log("the tile is not yours!");
      } else if (
        gameState?.players[socketId].pts < cardProperties[selectedCard.name].pts
      ) {
        toast.warn("You don't enough points to play this card");
        // console.log("not enough points!!!");
      } else if (gameState?.whoseMove !== socketId) {
        // console.log("not your turn!");
        toast.warn("It's not your turn");
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
      // IMPORTANT BELOW: account for different cards (maybe?? idk, OH with healing plants!) -> sprawdzaj i jak healujaca karta to ja zamiast "main tree"
      const opponentCard = checkOpponentsMainTree(rowIndex, colIndex)
        ? { name: "main tree" }
        : tile.cards.find((card) => card.owner !== socketId);
      // selected card may be opponent's card!
      if (opponentCard && selectedCard.owner === socketId) {
        if (gameState?.whoseMove !== socketId) {
          toast.warn("It's not your turn");
          // console.log("not your turn!");
        } else if (!selectedCard.hasAttack) {
          toast.warn("This card cannot attack now");
        } else if (
          opponentCard.name === "main tree" &&
          !["creepers"].includes(selectedCard.name) &&
          checkAnyEnemies(gameState?.board, socketId)
        ) {
          // make exceptions for cards that can ignore this rule!
          toast.warn(
            `${selectedCard.name} cannot attack the Main Tree. There are other enemies on the board`
          );
          // console.log("cannot attack main tree, other enemies on the board");
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
          toast.warn(
            `The target is out of range of ${selectedCard.name}'s attack`
          );
          // console.log("invalid range");
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
        // console.log({ ...clickedCard, hand: false });
        setSelectedCard({
          ...clickedCard,
          hand: false,
          row: rowIndex,
          col: colIndex,
        });
      }
    }
  };

  const handleHandClick = (card) => {
    if (gameEnded) {
      toast.warn("The game has already ended!");
      return;
    }
    setSelectedCard(
      selectedCard?.hand && selectedCard?.name === card
        ? null
        : {
            name: card,
            hand: true,
            owner: socketId,
            type: cardProperties[card].type,
          }
    );
  };

  const handlePass = () => {
    if (gameState?.whoseMove !== socketId) {
      toast.warn("It's not your turn");
      // console.log("not your turn!");
      return; // you could add it do disabled in <button>, idk
    }
    // for (const row of gameState?.board) {
    //   for (const tile of row) {
    //     for (const card of tile.cards) {
    //       if (card.hasAttack && card.owner === socketId) {
    //         console.log("some cards still have an attack to be performed");
    //         return;
    //       }
    //     }
    //   }
    // }
    if (checkAttacksLeft(gameState?.board, socketId)) {
      toast.warn("Some of your cards still have an attack to be performed");
      // console.log("some cards still have an attack to be performed");
      return;
    }
    passTurn();
  };

  return (
    <div className={classes.gameWrapper}>
      <Info gameState={gameState} socketId={socketId} handlePass={handlePass} />
      <div className={classes.boardArea}>
        <Board
          board={gameState?.board}
          onTileClick={handleTileClick}
          selectedCard={selectedCard}
          socketId={socketId}
          mainTreeHp={gameState?.players[socketId].mainTree}
          enemyMainTreeHp={
            gameState?.players[
              Object.keys(gameState?.players).find((id) => id !== socketId)
            ].mainTree
          }
        />
        <ActionsLog changesVector={changesVector} socketId={socketId} />
      </div>
      <div className={classes.table}>
        <Hand
          hand={gameState?.players[socketId].hand}
          selectedCard={selectedCard}
          onCardClick={handleHandClick}
          socketId={socketId}
        />
        <PtsBar
          curPts={gameState?.players[socketId].pts}
          turnNumber={gameState?.turnNumber}
        />
      </div>
    </div>
  );
};

export default Arena;
