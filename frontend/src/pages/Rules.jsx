import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import classes from "./Rules.module.css";

const Rules = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className={classes.rulesContainer}>
      <button onClick={() => navigate("/")} className="goBackBtn">
        ← {t("ui.goBack")}
      </button>
      <h1 className={classes.mainTitle}>Wajn Psired</h1>

      {/* OBJECTIVE */}
      <section className={classes.section}>
        <div className={classes.purposeText}>
          The objective is to <strong>destroy the opponent's Main Tree</strong>.
          If no Main Tree is destroyed after <strong>15 rounds</strong>, the
          match ends in a <strong>Draw</strong>.
        </div>
      </section>

      {/* ROUND 0: ENTRY PHASE */}
      <section className={classes.section}>
        <h2 className={classes.subTitle}>Round 0: Entry Phase</h2>
        <div className={`${classes.card} ${classes.entryRound}`}>
          <ul className={classes.bulletList}>
            <li>
              <strong>Starting Energy:</strong> Both players start with{" "}
              <strong>5 Nature Points</strong>.
            </li>
            <li>
              <strong>Starting Hand:</strong> The system automatically deals{" "}
              <strong>5 cards</strong> to your hand at the beginning of the
              match.
            </li>
            {/* <li>
              <strong>Digital Mulligan:</strong> You can spend{" "}
              <strong>1 Nature Point</strong> to automatically reshuffle your
              entire deck.
            </li> */}
            <li>
              <strong>Turn Logic:</strong> The system determines the starting
              player. This player will also start <strong>Round 1</strong>.
            </li>
          </ul>
        </div>
      </section>

      {/* ROUND FLOW (1-15) */}
      <section className={classes.section}>
        <h2 className={classes.subTitle}>Round Flow (1-15)</h2>
        <div className={classes.card}>
          <ol className={classes.stepList}>
            <li>
              <strong>Energy Influx & Refill:</strong> Receive 10 Nature Points
              (increases to <strong>15 pts from Round 13</strong>). Your hand
              gets refilled to hold up to <strong>5 cards</strong>
            </li>
            <li className={classes.restrictionNote}>
              <strong>No Mid-Round Draw:</strong> New cards are not granted
              during the Action Phase, even if your hand is empty.
            </li>
            <li>
              <strong>Action Phase:</strong> Players alternate taking 1 action:
              Build, Attack or Use Spell{/* , or Reed removal. */}
            </li>
            <li>
              <strong>Passing:</strong> When one player passes, the other can
              finish all remaining actions.
            </li>
          </ol>
        </div>
      </section>

      {/* THE MAIN TREE */}
      <section className={classes.section}>
        <h2 className={classes.subTitle}>The Main Tree</h2>
        <article className={classes.ruleBlock}>
          <ul className={classes.bulletList}>
            <li>
              <strong>Health:</strong> Starts with <strong>25 HP</strong>. Loss
              occurs at 0 HP.
            </li>
            <li>
              <strong>Protection:</strong> Immune to most attacks and spells if
              other objects are on your board.
            </li>
            <li>
              <strong>Armor Piercing:</strong> Specific units (scan their
              descriptions) can hit the Main Tree directly.
            </li>
            {/* <li>
              <strong>Healing:</strong> The only card able to heal your Main
              Tree is the <strong>Magic Tree</strong> (heals it by 1 HP).
            </li> */}
          </ul>
        </article>
      </section>

      <section className={classes.section}>
        <h2 className={classes.subTitle}>General Rules</h2>
        <article className={classes.ruleBlock}>
          <ul className={classes.bulletList}>
            <li>
              <strong>The Cycle:</strong> Used cards or destroyed objects move
              to the bottom of the deck.
            </li>
            <li>
              <strong>Resource Decay:</strong> Unused Nature Points are deleted
              at the end of each round.
            </li>
            <li>
              <strong>Summoning Sickness:</strong> Newly placed objects cannot
              attack until the next round.
            </li>
            <li>
              <strong>HP Cap:</strong> Objects can have max{" "}
              <strong>1 HP more</strong> than base value.
            </li>
          </ul>
        </article>
      </section>

      {/* GENERAL SYSTEM RULES */}
      <section className={classes.section}>
        <h2 className={classes.subTitle}>System Constraints</h2>
        <article className={classes.ruleBlock}>
          <ul className={classes.bulletList}>
            <li>
              <strong>Resource Decay:</strong> Unused Nature Points are deleted
              at the end of each round.
            </li>
            <li>
              <strong>Object Removal:</strong> Objects can only be removed
              during the break between rounds
              {/*, <strong>except</strong> for Reeds
              and Explosive Trees. */}
            </li>
            <li>
              <strong>The Cycle:</strong> Inactive/destroyed cards and one-time
              spells move to the bottom of the deck immediately. Continuous
              spells move there once exhausted.
            </li>
            <li>
              <strong>Summoning Sickness:</strong> Newly placed objects cannot
              attack immediately.
            </li>
            <li>
              <strong>HP Cap:</strong> Objects (except the Main Tree) can have
              max <strong>1 HP more</strong> than their starting value.
            </li>
            <li>
              <strong>Attack Logic:</strong> 0 DMG attacks are ignored unless
              the unit has a specific ability tied to that attack.
            </li>
            <li>
              <strong>Precision:</strong> All calculations use mathematical
              rounding.
            </li>
          </ul>
        </article>
      </section>

      {/* 5. SPECIAL MODES */}
      <section className={classes.section}>
        <div className={classes.comingSoonBadge}>
          <h2 className={classes.subTitle}>Special Modes</h2>
          <p>
            Coming Soon: Ranked Ladders, Challenges and many more.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Rules;
