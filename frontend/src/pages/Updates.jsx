import React from 'react';
import classes from "./Updates.module.css";

const Updates = () => {
  return (
    <div className={classes.updatesContainer}>
      <h1 className={classes.title}>Development Log</h1>
      
      <ul className={classes.updateList}>
        {/* LATEST UPDATE: FEBRUARY */}
        <li className={classes.updateItem}>
          <div className={classes.versionHeader}>
            <strong className={classes.versionNumber}>v0.2.0 — The Forest Awakens</strong>
            <span className={classes.date}>February 2026</span>
          </div>
          <ul className={classes.changeDetails}>
            <li>
              🌿 <strong>5 New Cards:</strong> Banana Tree, Meteorite, Hail, Medicinal Herbs, and Magic Force — try them out!
            </li>
            <li>
              ✨ <strong>Battle Effects:</strong> Watch damage flashes, healing pulses, death skulls, and spell explosions play out on the board as you fight.
            </li>
            <li>
              🎨 <strong>Fresh New Look:</strong> The entire game has been redesigned with a lush forest theme — from the menus to the battlefield.
            </li>
            <li>
              🔮 <strong>Delayed Spells:</strong> Some spells now activate after a number of turns. Time your plays to outsmart your opponent!
            </li>
            <li>
              🌍 <strong>Polish Language:</strong> The game is now available in Polish — switch in Settings!
            </li>
          </ul>
        </li>

        {/* ALPHA PREMIERE */}
        <li className={classes.updateItem}>
          <div className={classes.versionHeader}>
            <strong className={classes.versionNumber}>v0.1.0 — Early Alpha Premiere</strong>
            <span className={classes.date}>December 2025</span>
          </div>
          <ul className={classes.changeDetails}>
            <li>
              ⚔️ <strong>Multiplayer Mode:</strong> The first playable version of real-time network battles is now live.
            </li>
            <li>
              🃏 <strong>Card Collection:</strong> Explore the first 15 unique cards available in the core set.
            </li>
            <li>
              🌊 <strong>Sea Aesthetic:</strong> The initial implementation of the deep-sea interface for the main menus.
            </li>
          </ul>
        </li>
      </ul>
      
      <p className={classes.footerHint}>The forest grows deeper... more updates soon.</p>
    </div>
  );
};

export default Updates;