import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import Card from "../components/elements/Card";

import { cardProperties } from "../data/cardProperties";
import classes from "./Cards.module.css";

const cardNamesArray = Object.keys(cardProperties);

const Cards = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className={classes.cardsContainer}>
      <button onClick={() => navigate("/")} className="goBackBtn">
        ← {t("ui.goBack")}
      </button>
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
