import { useState, useEffect, useContext } from "react";
import { SocketContext } from "../../contexts/SocketContext";

import classes from "./Info.module.css";

const Info = ({ gameState, socketId, handlePass }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [yourGlobalTimeLeft, setYourGlobalTimeLeft] = useState(180);
  const [enemyGlobalTimeLeft, setEnemyGlobalTimeLeft] = useState(180);
  const { gameWinner } = useContext(SocketContext);

  useEffect(() => {
    if (!gameState?.actionStartedAt || gameWinner) return;
    const enemyId = Object.keys(gameState.players).find(
      (id) => id !== socketId
    );

    const interval = setInterval(() => {
      const elapsed = (Date.now() - gameState?.actionStartedAt) / 1000;
      const remaining = Math.max(0, 30 - elapsed);
      setTimeLeft(remaining);
      if (elapsed > 30) {
        const overtime = elapsed - 30;
        if (gameState?.whoseMove === socketId) {
          const globalRemaining = Math.max(
            0,
            gameState.players[socketId].globalTime - overtime
          );
          setYourGlobalTimeLeft(globalRemaining);
        } else {
          const globalRemaining = Math.max(
            0,
            gameState.players[enemyId].globalTime - overtime
          );
          setEnemyGlobalTimeLeft(globalRemaining);
        }
      } else {
        setYourGlobalTimeLeft(gameState.players[socketId].globalTime);
        setEnemyGlobalTimeLeft(gameState.players[enemyId].globalTime);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [gameState?.actionStartedAt, socketId, gameWinner]);

  const isYourTurn = gameState?.whoseMove === socketId;

  const getBankClass = (time) => {
    if (time <= 20) return classes.bankCritical;
    if (time <= 60) return classes.bankWarning;
    return classes.bankSafe;
  };

  return (
    <div className={classes.info}>
      {/* Turn Section */}
      <div className={classes.turnSection}>
        <p className={classes.turnLabel}>Turn {gameState?.turnNumber}/15</p>
        <div className={`${classes.turnIndicator} ${isYourTurn ? classes.yourTurn : classes.enemyTurn}`}>
          {isYourTurn ? "⚔ Your Move" : "⏳ Opponent's Move"}
        </div>
      </div>

      {/* Action Timer */}
      <div className={classes.actionSection}>
        <div className={classes.progressBarContainer}>
          <div
            className={`${classes.actionProgressBar} ${timeLeft <= 5 ? classes.timerCritical : ""}`}
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
        <span className={classes.timerText}>{Math.ceil(timeLeft)}s</span>
      </div>

      {/* Time Banks */}
      <div className={classes.bankSection}>
        <div className={classes.bankItem}>
          <span className={classes.bankLabel}>Your Bank</span>
          <span className={`${classes.bankValue} ${getBankClass(yourGlobalTimeLeft)}`}>
            {Math.ceil(yourGlobalTimeLeft)}s
          </span>
        </div>
        <div className={classes.bankItem}>
          <span className={classes.bankLabel}>Enemy Bank</span>
          <span className={`${classes.bankValue} ${getBankClass(enemyGlobalTimeLeft)}`}>
            {Math.ceil(enemyGlobalTimeLeft)}s
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className={classes.controlsSection}>
        <button
          className={classes.passBtn}
          disabled={gameState?.players[socketId]?.passed || gameState?.whoseMove !== socketId}
          onClick={handlePass}
        >
          Pass Turn
        </button>
        <p className={classes.statusText}>
          Opponent:{" "}
          {gameState?.players[
            Object.keys(gameState?.players || {}).find((id) => id !== socketId)
          ]?.passed
            ? "Passed"
            : "Still plays"}
        </p>
      </div>
    </div>
  );
};

export default Info;
