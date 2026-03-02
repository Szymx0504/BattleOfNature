import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import classes from "./Card.module.css";

const categoryConfig = {
  fighter: { icon: "⚔️", label: "Fighter" },
  siege: { icon: "🎯", label: "Siege" },
  defender: { icon: "🛡️", label: "Defender" },
  support: { icon: "💚", label: "Support" },
};

const Card = ({ i, classKeys, cardName, cardDetails, handleClick, menu }) => {
  const { t } = useLanguage();
  const [showMobileTooltip, setShowMobileTooltip] = useState(false);
  const [tooltipStyles, setTooltipStyles] = useState({});
  const [longPressTimer, setLongPressTimer] = useState(null);

  // Track if a long press just occurred so the immediate touchend/click doesn't select the card
  const [longPressFired, setLongPressFired] = useState(false);
  const cardRef = useRef(null);

  const displayName = t(`cards.${cardName}.name`);
  const displayDescription = t(`cards.${cardName}.description`);

  const category = cardDetails.category;
  const isSpell = cardDetails.type === "spell";
  const catConfig = !isSpell && category ? categoryConfig[category] : null;

  useEffect(() => {
    // 1. Close if another card's long-press tooltip opened
    const handleTooltipOpened = (e) => {
      if (e.detail !== cardName) {
        setShowMobileTooltip(false);
      }
    };

    // 2. Close if the user taps/clicks ANYWHERE else on the screen (including other cards)
    const handleDocumentClick = (e) => {
      // If the tooltip is actively showing, and we click something that ISN'T this exact li element...
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowMobileTooltip(false);
      }
    };

    window.addEventListener("mobile-tooltip-opened", handleTooltipOpened);

    // We only attach document click if tooltip is currently showing to save performance
    if (showMobileTooltip) {
      // Timeout ensures the initial click/tap that opened it doesn't instantly close it
      setTimeout(() => {
        document.addEventListener("click", handleDocumentClick);
        document.addEventListener("touchstart", handleDocumentClick);
      }, 0);
    }

    return () => {
      window.removeEventListener("mobile-tooltip-opened", handleTooltipOpened);
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("touchstart", handleDocumentClick);
    };
  }, [cardName, showMobileTooltip]);

  // NEW HOLD/LONG PRESS LOGIC FOR MOBILE TOOLTIP
  const startLongPress = (e) => {
    if (window.innerWidth <= 768) {
      // Capture the event state we need for the timer
      const target = e.currentTarget;

      const timer = setTimeout(() => {
        if (!showMobileTooltip) {
          if (classKeys.includes("hand")) {
            const rect = target.getBoundingClientRect();
            let centerLeft = rect.left + rect.width / 2;
            let finalLeft = centerLeft;
            let transformStr = "translateX(-50%) translateY(0)";

            if (centerLeft < 110) {
              finalLeft = 10;
              transformStr = "translateY(0)";
            } else if (centerLeft > window.innerWidth - 110) {
              finalLeft = window.innerWidth - 10;
              transformStr = "translateX(-100%) translateY(0)";
            }

            const fromBottom = window.innerHeight - rect.top + 10;

            setTooltipStyles({
              left: `${finalLeft}px`,
              bottom: `${fromBottom}px`,
              top: "auto",
              transform: transformStr
            });
          }
          window.dispatchEvent(new CustomEvent("mobile-tooltip-opened", { detail: cardName }));
          setShowMobileTooltip(true);
          setLongPressFired(true); // Flag to prevent the click
        }
      }, 500); // 500ms hold to show description
      setLongPressTimer(timer);
    }
  };

  const cancelLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Regular tap selects the card
  const onCardTap = (e) => {
    // If we just fired a long press, ignore this click to prevent unwanted UI changes
    if (longPressFired) {
      setLongPressFired(false);
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    // Close the tooltip if it's open, but still proceed with card selection
    if (showMobileTooltip && window.innerWidth <= 768) {
      setShowMobileTooltip(false);
    }

    cancelLongPress();
    if (handleClick) handleClick(e);
  };

  return (
    <li
      ref={cardRef}
      key={i}
      onClick={onCardTap}
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      className={[
        classes.card,
        ...classKeys.map((c) => classes[c] || c),
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
      <p className={displayName.length >= 10 ? classes.longName : ""}>{displayName}</p>

      {/* Card Image */}
      <img
        className={classes.cardImage}
        src={"/assets/cards/" + cardName.replace(/ /g, "_") + ".png"}
        alt={cardName}
      />

      {/* Stats Bar */}
      <div className={`${classes.stats} ${menu && classes.menuStats}`}>
        <span
          className={isSpell && cardDetails.dmg !== undefined ? classes.dmg : classes.hp}
          style={isSpell && cardDetails.dmg !== undefined && Array.isArray(cardDetails.dmg) ? { fontSize: "0.85em", padding: "0.2em 0", letterSpacing: "-0.5px" } : {}}
        >
          {isSpell
            ? (cardDetails.dmg !== undefined
              ? "⚔ " + (Array.isArray(cardDetails.dmg) ? cardDetails.dmg.join("/") : cardDetails.dmg)
              : "♥ " + cardDetails.hp)
            : "♥ " + cardDetails.hp}
        </span>
        <span className={classes.cost}>
          {"✦ " + cardDetails.pts}
        </span>
        <span
          className={isSpell && cardDetails.dmg === undefined ? classes.hp : classes.dmg}
          style={isSpell && cardDetails.dmg === undefined ? {} : (cardDetails.dmg !== undefined && Array.isArray(cardDetails.dmg) ? { fontSize: "0.85em", padding: "0.2em 0", letterSpacing: "-0.5px" } : {})}
        >
          {isSpell && cardDetails.dmg === undefined
            ? "♥ " + cardDetails.hp
            : "⚔ " + (cardDetails.dmg !== undefined
              ? (Array.isArray(cardDetails.dmg) ? cardDetails.dmg.join("/") : cardDetails.dmg)
              : cardDetails.hp)}
        </span>
      </div>

      {/* Description Tooltip & Mobile Action Menu */}
      <div
        className={`${classes.description} ${showMobileTooltip ? classes.forceShow : ""}`}
        style={showMobileTooltip && window.innerWidth <= 768 && classKeys.includes("hand") ? tooltipStyles : undefined}
      >
        <p className={classes.descText}>{displayDescription}</p>
      </div>
    </li>
  );
};

export default Card;