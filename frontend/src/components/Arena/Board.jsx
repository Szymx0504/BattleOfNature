import "./Board.css";

const Board = ({ board, onTileClick }) => {
  return (
    <div>
      <div className="board">
        {/* look if those key= are useful */}
        {board.map((row, i) => (
          <div key={i} className="row">
            {row.map((tile, j) => (
              <div key={j} className="tile" onClick={() => onTileClick(tile, i, j)}>
                {tile.mainTree && "Main Tree"}
                {tile.inactive && "inactive"}
                {/* INCLUDE POSSIBILITY OF MANY CARDS */}
                {tile.cards.length ? <div>
                    <p>{tile.cards[0].name}</p>
                    <p>{tile.cards[0].hp}hp</p>
                    {/* <p>{tile.cards[0].pts}pts</p>
                    <p>{tile.cards[0].dmg}dmg</p> */}
                    <p>{tile.cards[0].hasAttack ? "yes":"no"} attack</p>
                  </div> : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
