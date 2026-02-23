import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useLanguage } from "../contexts/LanguageContext";

import CardSelection from "../components/Play/CardSelection";

import classes from "./Play.module.css";

const Play = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isConnected, gameState, gameId, socketId, findOpponent } =
    useSocket();
  const [deckInfo, setDeckInfo] = useState({
    cards: [
      "timberman",
      "acacia",
      "chopper",
      "creepers",
      "linden",
      "medicinal herbs",
      "apple tree",
      "bark beetles",
      "birch",
      "bush",
      "chestnut",
      "pine",
      "poplar",
      "spruce",
      "willow",
    ],
    legendary: 1,
    rare: 5,
    common: 9,
  });
  const [validDeck, setValidDeck] = useState(true);
  const [findingOpponent, setFindingOpponent] = useState(false);

  const handleFindOpponent = () => {
    findOpponent(deckInfo.cards);
    setFindingOpponent(true);
  };

  useEffect(() => {
    const isValid =
      deckInfo.cards.length === 15 &&
      deckInfo.legendary <= 1 &&
      deckInfo.rare <= 5;
    setValidDeck(isValid);
  }, [deckInfo, setValidDeck]);

  useEffect(() => {
    if (gameState !== null && gameId) {
      navigate(`/arena/${gameId}`);
    }
  }, [gameState, gameId, navigate]);

  return (
    <div className={classes.playContainer}>
      <h1 className={classes.title}>{t("play.title")}</h1>
      <CardSelection deckInfo={deckInfo} setDeckInfo={setDeckInfo} />
      <div className={classes.opponentSection}>
        {findingOpponent && <p className={classes.loadingText}>{t("play.searching")}</p>}
        <button
          onClick={handleFindOpponent}
          disabled={!isConnected || !validDeck || findingOpponent}
          className={classes.findOpponentButton}
        >
          {t("play.findOpponent")}
        </button>
      </div>
    </div>
  );
};

export default Play;
