import { useLanguage } from "../../contexts/LanguageContext";
import classes from "./ActiveSpells.module.css";

const ActiveSpells = ({ yourSpells, enemySpells, socketId }) => {
  const { t } = useLanguage();

  const allSpells = [
    ...(yourSpells || []).map(s => ({ ...s, isEnemy: false })),
    ...(enemySpells || []).map(s => ({ ...s, isEnemy: true })),
  ];

  if (allSpells.length === 0) return null;

  return (
    <div className={classes.container}>
      <p className={classes.title}>{t("spells.title")}</p>
      <div className={classes.spellList}>
        {allSpells.map((spell, i) => (
          <div
            key={i}
            className={`${classes.spellCard} ${spell.isEnemy ? classes.enemy : classes.yours}`}
          >
            <div className={classes.spellHeader}>
              <img src={"/assets/cards/" + spell.name.replace(" ", "_") + ".png"} />
              <div className={classes.spellInfo}>
                <span className={classes.spellName}>{spell.name}</span>
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
