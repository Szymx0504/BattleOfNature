import classes from "./Hand.module.css";
import { cardProperties } from "../../assets/cardProperties";
import Card from "../elements/Card";

// cardProperties will be requested from the db

const Hand = ({ hand, selectedCard, onCardClick, socketId }) => {
  return (
      <ul className={classes.hand}>
        {hand?.map((card, i) => (
          <Card
            i={i}
            classKeys={["card", selectedCard?.name === card && selectedCard?.owner === socketId && "cardSelected", cardProperties[card].rarity, "hand"]}
            cardName={card}
            cardDetails={cardProperties[card]}
            handleClick={() =>
              onCardClick(
                selectedCard?.hand && selectedCard?.name === card
                  ? null
                  : { name: card, hand: true, owner: socketId }
              )
            }
          />
        ))}
      </ul>
  );
};
export default Hand;
