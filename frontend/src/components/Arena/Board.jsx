import Card from "../elements/Card";

import classes from "./Board.module.css";

const Board = ({ board, onTileClick, selectedCard, socketId, params }) => {
  return (
    <div className={classes.board}>
      {/* look if those key= are useful */}
      {board.map((row, i) => (
        <div key={i} className={classes.row}>
          {row.map(
            (tile, j) =>
              !tile.inactive && (
                <div
                  key={j}
                  className={classes.tile}
                  onClick={() => onTileClick(tile, i, j)}
                >
                  <div className={classes.tileContent}>
                    {tile.mainTree ? (
                      <div className={classes.mainTree}>
                        <img src="/src/assets/elements/main_tree.png" />
                        <p>
                          {
                            params[
                              i <= 1
                                ? socketId + "MainTreeHp"
                                : Object.keys(params).find(
                                    (param) =>
                                      param.endsWith("MainTreeHp") &&
                                      !param.startsWith(socketId)
                                  )
                            ]
                          }
                          hp
                        </p>
                      </div>
                    ) : null}
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
              )
          )}
        </div>
      ))}
    </div>
  );
};

export default Board;
