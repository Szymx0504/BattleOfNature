import Card from "../components/elements/Card";

import { cardProperties } from "../data/cardProperties";
import classes from "./Cards.module.css";

const cardNamesArray = Object.keys(cardProperties);

const Cards = () => {
  return (
    <div className={classes.cardsContainer}>
      <p className={classes.title}>All cards available in the game</p>
      <ul className={classes.cardList}>
        {Object.entries(cardProperties).map(([cardName, cardDetails], i) => (
          <Card
            i={i}
            classKeys={[cardDetails.rarity]}
            cardName={cardName}
            cardDetails={cardDetails}
          />
        ))}
      </ul>
    </div>
  );
};

export default Cards;
