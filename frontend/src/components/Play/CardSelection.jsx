import { toast } from "react-toastify";

import Card from "../elements/Card";
import { cardProperties } from "../../assets/cardProperties";

import classes from "./CardSelection.module.css";

const CardSelection = ({ deckInfo, setDeckInfo }) => {
  const selectCard = (cardName, cardRarity) => {
    // const htmlCard = document.getElementById("CardSelection__" + cardName);
    if (!deckInfo.cards.includes(cardName)) {
      if (
        (cardRarity != "legendary" || deckInfo.legendary < 1) &&
        (cardRarity != "rare" || deckInfo.rare < 5) &&
        deckInfo.cards.length < 15
      ) {
        setDeckInfo((prev) => ({
          ...prev,
          cards: [...prev.cards, cardName],
          [cardRarity]: prev[cardRarity] + 1,
        }));
        // htmlCard.style.opacity = 0.5;
      } else {
        toast.warn("Not a valid choice!");
        console.log("not a valid choice!!!"); // yield a warning
      }
    } else {
      setDeckInfo((prev) => ({
        ...prev,
        cards: prev.cards.filter((card) => card !== cardName),
        [cardRarity]: prev[cardRarity] - 1,
      }));
      //   htmlCard.style.opacity = 1;
    }
  };

  return (
    <div className={classes.cardSelectionWrapper}>
      <div className={classes.deckSummary}>
        <h2 className={classes.summaryTitle}>Current Deck</h2>
        <div className={classes.rarityStats}>
          <p>
            Legendaries:{" "}
            <span className={classes.legendaryCount}>
              {deckInfo.legendary}/1
            </span>
          </p>
          <p>
            Rarity: <span className={classes.rareCount}>{deckInfo.rare}/5</span>
          </p>
          <p>
            Commons:{" "}
            <span className={classes.commonCount}>{deckInfo.common}</span>
          </p>
          <p>
            Total:{" "}
            <span className={classes.totalCount}>
              {deckInfo.legendary + deckInfo.rare + deckInfo.common}/15
            </span>
          </p>
        </div>
      </div>
      <div className={classes.collectionWrapper}>
        <h2 className={classes.collectionTitle}>Available Cards</h2>
        <ul className={classes.cardList}>
          {Object.entries(cardProperties).map(([cardName, cardDetails], i) => (
            <Card
              i={i}
              classKeys={[
                deckInfo.cards.includes(cardName) && "cardSelected",
                cardDetails.rarity,
              ]}
              cardName={cardName}
              cardDetails={cardDetails}
              handleClick={() => {
                selectCard(cardName, cardDetails.rarity);
              }}
              menu
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CardSelection;
