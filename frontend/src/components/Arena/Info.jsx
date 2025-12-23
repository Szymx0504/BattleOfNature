import { useState, useEffect } from "react";

import classes from "./Info.module.css";

const Info = ({ gameState, socketId, handlePass }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [yourGlobalTimeLeft, setYourGlobalTimeLeft] = useState(180);
  const [enemyGlobalTimeLeft, setEnemyGlobalTimeLeft] = useState(180);

  useEffect(() => {
    if (!gameState?.actionStartedAt) return;
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
  }, [gameState?.actionStartedAt, socketId]);

  return (
  <div className={classes.info}>
    {/* Sekcja Tury */}
    <div className={classes.timerWrapper}>
      <p className={classes.label}>Turn {gameState?.turnNumber}/15</p>
      <p className={gameState?.whoseMove === socketId ? classes.activeMove : classes.passiveMove}>
        {gameState?.whoseMove === socketId ? "Your move" : "Opponent's move"}
      </p>
    </div>

    {/* Pasek Czasu Akcji - Twój Błękit #64d2ff */}
    <div className={classes.actionSection}>
      <div className={classes.progressBarContainer}>
        <div 
          className={classes.actionProgressBar} 
          style={{ width: `${(timeLeft / 30) * 100}%` }}
        />
      </div>
      <span className={classes.timerText}>{Math.ceil(timeLeft)}s</span>
    </div>

    {/* Banki Czasu - Twoja Zieleń #5A9266 */}
    <div className={classes.bankSection}>
      <div className={classes.bankItem}>
        <span className={classes.bankLabel}>Your Bank</span>
        <span className={classes.bankValue}>{Math.ceil(yourGlobalTimeLeft)}s</span>
      </div>
      <div className={classes.bankItem}>
        <span className={classes.bankLabel}>Enemy Bank</span>
        <span className={classes.bankValue}>{Math.ceil(enemyGlobalTimeLeft)}s</span>
      </div>
    </div>

    {/* Przyciski i Statusy */}
    <div className={classes.controlsSection}>
      <button
        className={classes.passBtn}
        disabled={gameState?.players[socketId]?.passed || gameState?.whoseMove !== socketId}
        onClick={handlePass}
      >
        Pass turn
      </button>
      <p className={classes.statusText}>
        Opponent: {
          gameState?.players[
            Object.keys(gameState?.players || {}).find((id) => id !== socketId)
          ]?.passed ? "Passed" : "Still plays"
        }
      </p>
    </div>
  </div>
);
};

export default Info;
