import classes from "./Card.module.css";

const Card = ({i, classKeys, cardName, cardDetails, handleClick}) => {
  return (
    <li
      key={i}
      // id={`CardSelection__${cardName}`}
      onClick={handleClick && handleClick}
      className={[classes.card, ...classKeys.map(c => classes[c])].filter(Boolean).join(" ")}
    >
      <p>{cardName}</p>
      <img src={"/src/assets/cards/" + cardName.replace(" ", "_") + ".png"} />
      <div className={classes.stats}>
        <span className={cardDetails.hp ? classes.hp : classes.dmg}>
          {/* {cardDetails.hp || cardDetails.dmg} */}
          {cardDetails.hp ? cardDetails.hp + "hp" : cardDetails.dmg + "dmg"}
        </span>
        <span className={classes.cost}>{cardDetails.pts}pts</span>
        <span
          className={cardDetails.dmg !== undefined ? classes.dmg : classes.hp}
        >
          {cardDetails.dmg !== undefined
            ? cardDetails.dmg + "dmg"
            : cardDetails.hp + "hp"}
        </span>
        <div className={classes.description}>{cardDetails.description}</div>
      </div>
    </li>
  );
};

export default Card;