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
            <span className={classes.legendaryCount}>{deckInfo.legendary}</span>
          </p>
          <p>
            Rarity: <span className={classes.rareCount}>{deckInfo.rare}</span>
          </p>
          <p>
            Commons:{" "}
            <span className={classes.commonCount}>{deckInfo.common}</span>
          </p>
        </div>
      </div>
      <h2 className={classes.collectionTitle}>Available Cards</h2>
      <ul className={classes.cardList}>
        {Object.entries(cardProperties).map(([cardName, cardDetails], i) => (
          <li
            key={i}
            // id={`CardSelection__${cardName}`}
            onClick={() => {
              selectCard(cardName, cardDetails.rarity);
            }}
            className={`${classes.card} ${
              deckInfo.cards.includes(cardName) ? classes.cardSelected : ""
            }`}
          >
            <p>{cardName}</p>
            <img
              src={"/src/assets/cards/" + cardName.replace(" ", "_") + ".png"}
            />
            <div className={classes.stats}>
              <span className={cardDetails.hp ? classes.hp : classes.dmg}>
                {/* {cardDetails.hp || cardDetails.dmg} */}
                {cardDetails.hp
                  ? cardDetails.hp + "hp"
                  : cardDetails.dmg + "dmg"}
              </span>
              <span className={classes.cost}>{cardDetails.pts}pts</span>
              <span className={cardDetails.dmg !== undefined ? classes.dmg : classes.hp}>
                {cardDetails.dmg !== undefined
                  ? cardDetails.dmg + "dmg"
                  : cardDetails.hp + "hp"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CardSelection;
