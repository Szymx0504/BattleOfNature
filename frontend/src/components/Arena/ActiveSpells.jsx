import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import classes from "./ActiveSpells.module.css";

const ActiveSpells = ({ yourSpells, enemySpells, socketId }) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef(null);

  const allSpells = [
    ...(yourSpells || []).map(s => ({ ...s, isEnemy: false })),
    ...(enemySpells || []).map(s => ({ ...s, isEnemy: true })),
  ];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isExpanded && containerRef.current && !containerRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isExpanded]);

  const toggleExpand = () => {
    if (window.innerWidth <= 768) {
      setIsExpanded(!isExpanded);
    }
  };

  if (allSpells.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`${classes.container} ${isExpanded ? classes.expanded : ""}`}
    >
      <p className={classes.title} onClick={toggleExpand}>
        {t("spells.title")} {window.innerWidth <= 768 && `(${allSpells.length})`}
      </p>

      {/* On desktop, this is always visible. On mobile, it's only visible if isExpanded is true */}
      <div className={`${classes.spellList} ${!isExpanded ? classes.mobileHidden : ""}`}>
        {allSpells.map((spell, i) => (
          <div
            key={i}
            className={`${classes.spellCard} ${spell.isEnemy ? classes.enemy : classes.yours}`}
          >
            <div className={classes.spellHeader}>
              <img src={"/assets/cards/" + spell.name.replace(" ", "_") + ".png"} />
              <div className={classes.spellInfo}>
                <span className={classes.spellName}>{t(`cards.${spell.name}.name`)}</span>
                <span className={classes.spellDmg}>⚔ {spell.dmg}dmg</span>
                <span className={classes.spellTurns}>
                  {spell.turnsLeft === 1 ? "⏳ " + t("spells.nextTurn") : `⏳ ${spell.turnsLeft}t`}
                </span>
              </div>
            </div>
            {spell.targets && spell.targets.length > 0 && (
              <div className={classes.targets}>
                <span className={classes.targetsLabel}>{t("spells.targets")}</span>
                {spell.targets.map((target, j) => (
                  <span key={j} className={classes.targetName}>
                    {target.owner === socketId ? t("spells.your") + " " : t("spells.enemys") + " "}
                    {target.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveSpells;
