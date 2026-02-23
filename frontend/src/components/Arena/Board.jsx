import Card from "../elements/Card";
import VFX from "./VFX";

import classes from "./Board.module.css";

const Board = ({ board, onTileClick, selectedCard, socketId, mainTreeHp, enemyMainTreeHp, changesVector }) => {
  return (
    <div className={classes.board}>
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
                        <img src="/assets/elements/main_tree.png" alt="Main Tree" />
                        <div className={classes.mainTreeHp}>
                          <span className={classes.mainTreeHpIcon}>♥</span>
                          <span className={classes.mainTreeHpValue}>
                            {i <= 1 ? enemyMainTreeHp : mainTreeHp}
                          </span>
                          <span className={classes.mainTreeHpLabel}>hp</span>
                        </div>
                      </div>
                    ) : null}
                    {tile.cards.length ? (
                      <Card
                        i="0"
                        classKeys={[
                          selectedCard?.name === tile.cards[0].name &&
                            selectedCard?.owner === tile.cards[0].owner &&
                            "cardSelected",
                          tile.cards[0]?.rarity,
                          "board",
                          tile.cards[0].owner !== socketId && "opponent",
                          tile.cards[0].hasAttack && "hasAttack",
                          tile.mainTree && "onMainTree"
                        ]}
                        cardName={tile.cards[0].name}
                        cardDetails={tile.cards[0]}
                      />
                    ) : (
                      ""
                    )}
                    {/* Render VFX over this specific tile */}
                    <VFX changesVector={changesVector} row={i} col={j} />
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
