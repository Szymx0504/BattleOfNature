import Card from "../elements/Card";

import classes from "./Board.module.css";

const Board = ({ board, onTileClick, selectedCard }) => {
  return (
    <div className={classes.board}>
      {/* look if those key= are useful */}
      {board.map((row, i) => (
        <div key={i} className={classes.row}>
          {row.map((tile, j) => (
            <div
              key={j}
              className={classes.tile}
              onClick={() => onTileClick(tile, i, j)}
            >
              <div className={classes.tileContent}>
                {/* {tile.mainTree && "Main Tree"}
                {tile.inactive && "inactive"} */}
                {/* INCLUDE POSSIBILITY OF MANY CARDS */}
                {tile.cards.length ? (
                  <Card
                    i="0"
                    classKeys={[
                      "card",
                      selectedCard?.name === tile.cards[0].name &&
                        selectedCard?.owner === tile.cards[0].owner &&
                        "cardSelected",
                      tile.cards[0]?.rarity,
                      "board",
                    ]}
                    cardName={tile.cards[0].name}
                    cardDetails={tile.cards[0]}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
