import classes from "./Card.module.css";

const categoryConfig = {
  fighter: { icon: "⚔️", label: "Fighter" },
  siege: { icon: "🎯", label: "Siege" },
  defender: { icon: "🛡️", label: "Defender" },
  support: { icon: "💚", label: "Support" },
};

const Card = ({ i, classKeys, cardName, cardDetails, handleClick, menu }) => {
  const category = cardDetails.category;
  const isSpell = cardDetails.type === "spell";
  const catConfig = !isSpell && category ? categoryConfig[category] : null;

  return (
    <li
      key={i}
      onClick={handleClick && handleClick}
      className={[
        classes.card,
        ...classKeys.map((c) => classes[c]),
        catConfig ? classes[`cat_${category}`] : isSpell ? classes.cat_spell : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Colored top stripe for category */}
      {catConfig && (
        <div className={classes.categoryStripe}>
          {catConfig.icon}
        </div>
      )}

      {/* Type icon (tree/bush/spell/building) in top-left */}
      <img
        className={classes.typeIcon}
        src={`/assets/card_types/${cardDetails.type}.png`}
        alt={cardDetails.type}
      />

      {/* Card Name */}
      <p className={cardName.length >= 10 ? classes.longName : ""}>{cardName}</p>

      {/* Card Image */}
      <img
        className={classes.cardImage}
        src={"/assets/cards/" + cardName.replace(/ /g, "_") + ".png"}
        alt={cardName}
      />

      {/* Stats Bar */}
      <div className={`${classes.stats} ${menu && classes.menuStats}`}>
        <span className={isSpell && cardDetails.dmg !== undefined ? classes.dmg : classes.hp}>
          {isSpell
            ? (cardDetails.dmg !== undefined
              ? "⚔ " + (Array.isArray(cardDetails.dmg) ? cardDetails.dmg.join("/") : cardDetails.dmg)
              : "♥ " + cardDetails.hp)
            : "♥ " + cardDetails.hp}
        </span>
        <span className={classes.cost}>
          {"✦ " + cardDetails.pts}
        </span>
        <span className={isSpell && cardDetails.dmg === undefined ? classes.hp : classes.dmg}>
          {isSpell && cardDetails.dmg === undefined
            ? "♥ " + cardDetails.hp
            : "⚔ " + (cardDetails.dmg !== undefined
              ? (Array.isArray(cardDetails.dmg) ? cardDetails.dmg.join("/") : cardDetails.dmg)
              : cardDetails.hp)}
        </span>
      </div>

      {/* Description Tooltip */}
      <div className={classes.description}>{cardDetails.description}</div>
    </li>
  );
};

export default Card;