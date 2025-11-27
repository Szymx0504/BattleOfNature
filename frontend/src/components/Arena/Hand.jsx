import classes from "./Hand.module.css";
import { cardProperties } from "../../assets/cardProperties";

// cardProperties will be requested from the db

const Hand = ({ hand, selectedCard, onCardClick, socketId }) => {
  return (
    <div>
      <ul className={classes.hand}>
        {hand?.map((card, i) => (
          <li
            key={i}
            className={`${classes.card} ${
              selectedCard?.name === card && selectedCard?.owner === socketId && classes.selected
            }`}
            onClick={() => onCardClick({name: card, hand: true, owner: socketId})}
          >
            <p>{card}</p>
            <div className={classes.stats}>
              <p>
                {cardProperties[card].hp
                  ? cardProperties[card].hp + "hp"
                  : cardProperties[card].dmg + "dmg"}
              </p>
              <p>{cardProperties[card].pts}pts</p>
              <p>
                {cardProperties[card].dmg
                  ? cardProperties[card].dmg + "dmg"
                  : cardProperties[card].hp + "hp"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Hand;
