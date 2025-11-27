import { cardProperties } from "../../assets/cardProperties";

import "./CardSelection.css";

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
    <div>
      <div>
        <p>Legendaries: {deckInfo.legendary}</p>
        <p>Rarity: {deckInfo.rare}</p>
        <p>Commons: {deckInfo.common}</p>
      </div>
      <ul>
        {Object.entries(cardProperties).map(([cardName, cardDetails], i) => (
          <li
            key={i}
            // id={`CardSelection__${cardName}`}
            onClick={() => {
              selectCard(cardName, cardDetails.rarity);
            }}
            className={`card ${deckInfo.cards.includes(cardName) ? "card-selected" : "card-available"}`}
          >
            {cardName} - {cardDetails.rarity} rarity
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CardSelection;
