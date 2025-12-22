import React from 'react';
import classes from "./Updates.module.css";

const Updates = () => {
  return (
    <div className={classes.updatesContainer}>
      <h1 className={classes.title}>Development Log</h1>
      
      <ul className={classes.updateList}>
        {/* LATEST UPDATE: ALPHA PREMIERE */}
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
              🃏 <strong>Card Collection:</strong> Explore the first 25 unique cards available in the core set.
            </li>
            <li>
              🌊 <strong>Sea Aesthetic:</strong> The initial implementation of the deep-sea interface for the main menus.
            </li>
          </ul>
        </li>

        {/* You can add future entries here */}
      </ul>
      
      {/* Optional: Add a subtle hint that more is coming */}
      <p className={classes.footerHint}>The tides are shifting... more updates soon.</p>
    </div>
  );
};

export default Updates;