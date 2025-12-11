import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

import CardSelection from "../components/Play/CardSelection";

import classes from "./Play.module.css";

const Play = () => {
  const navigate = useNavigate();
  const { isConnected, gameState, gameId, socketId, findOpponent } =
    useSocket();
  // const [deckInfo, setDeckInfo] = useState({cards: [], legendary: 0, rare: 0, common: 0});
  const [deckInfo, setDeckInfo] = useState({
    cards: [
      "timberman", // hard coded for now to speed up testing
      "acacia",
      "chopper",
      "creeper",
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
  // const [validDeck, setValidDeck] = useState(false);
  const [validDeck, setValidDeck] = useState(true); // temporarily
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
      <h1 className={classes.title}>Prepare Your Deck</h1>
      <CardSelection deckInfo={deckInfo} setDeckInfo={setDeckInfo} />
      <div className={classes.opponentSection}>
        {findingOpponent && <p className={classes.loadingText}>Looking for opponent...</p>}
        <button
          onClick={handleFindOpponent}
          disabled={!isConnected || !validDeck || findingOpponent}
          className={classes.findOpponentButton}
        >
          Find Opponent
        </button>
      </div>
    </div>
  );
};

export default Play;
