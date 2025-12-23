import classes from "./Hand.module.css";
import { cardProperties } from "../../data/cardProperties";
import Card from "../elements/Card";

// cardProperties will be requested from the db

const Hand = ({ hand, selectedCard, onCardClick, socketId }) => {
  return (
    <ul className={classes.hand}>
      {hand?.map((card, i) => (
        <Card
          i={i}
          classKeys={[
            selectedCard?.name === card &&
              selectedCard?.owner === socketId &&
              "cardSelected",
            cardProperties[card].rarity,
            "hand",
          ]}
          cardName={card}
          cardDetails={cardProperties[card]}
          handleClick={() => {
            onCardClick(card);
          }}
        />
      ))}
    </ul>
  );
};
export default Hand;
