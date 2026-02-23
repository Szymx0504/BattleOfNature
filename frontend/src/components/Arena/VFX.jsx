import { useState, useEffect } from "react";
import classes from "./VFX.module.css";

const vfxConfig = {
  damageTaken: { className: "vfxDamage" },
  death: { className: "vfxDeath", emoji: "💀" },
  heal: { className: "vfxHeal" },
  played: { className: "vfxPlace" },
  place: { className: "vfxPlace" },
  spellTriggered: { className: "vfxSpell", emoji: "🔮" },
};

const VFX = ({ changesVector, row, col }) => {
  const [stamp, setStamp] = useState(Date.now());

  // Watch for changesVector updates to re-trigger CSS animations
  // by changing the React key on the container.
  useEffect(() => {
    setStamp(Date.now());
  }, [changesVector]);

  if (!changesVector || changesVector.length === 0) return null;

  // Filter precisely for this tile
  const tileEffects = changesVector.filter((c) => c.row == row && c.col == col);
  
  if (tileEffects.length === 0) return null;

  return (
    <>
      {tileEffects.map((effect, idx) => {
        const config = vfxConfig[effect.action];
        if (!config) return null;

        return (
          <div
            key={`${stamp}-${idx}`}
            className={`${classes.vfxEffect} ${classes[config.className]}`}
            style={{ zIndex: 9999 }}
          >
            {config.emoji && (
              <span className={classes.vfxEmoji}>{config.emoji}</span>
            )}
            {effect.action === "damageTaken" && effect.value && (
              <span className={classes.vfxDamageText}>-{effect.value}</span>
            )}
            {effect.action === "heal" && effect.value && (
              <span className={classes.vfxHealText}>+{effect.value}</span>
            )}
          </div>
        );
      })}
    </>
  );
};

export default VFX;
