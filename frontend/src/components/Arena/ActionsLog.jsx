import { useLanguage } from "../../contexts/LanguageContext";
import classes from "./ActionsLog.module.css";

const goodIfYours = ["heal", "played", "linden", "oxytree", "reactivate", "spellTriggered"];
const badIfYours = ["death", "damageTaken"];
const neutral = ["place", "passed", "newTurn", "spellDeactivated"];

const actionIcons = {
  heal: "💚",
  played: "✨",
  death: "💀",
  damageTaken: "⚔",
  place: "📍",
  linden: "🌳",
  oxytree: "🌿",
  reactivate: "⚡",
  spellTriggered: "🔮",
  spellDeactivated: "💨",
  passed: "⏭",
  newTurn: "🔄",
};

const actionLogKeys = {
  heal: "log.healed",
  played: "log.played",
  death: "log.died",
  damageTaken: "log.tookDamage",
  place: "log.placed",
  linden: "log.doubledDamage",
  oxytree: "log.increasedDamage",
  reactivate: "log.reactivated",
  spellTriggered: "log.spellTriggered",
  spellDeactivated: "log.spellFizzled",
};

const getActionImpact = (socketId, change, classes) => {
  const isYourAction = change.owner === socketId;

  if (neutral.includes(change.action)) {
    return classes.neutralAction;
  }
  if (
    (isYourAction && goodIfYours.includes(change.action)) ||
    (!isYourAction && badIfYours.includes(change.action))
  ) {
    return classes.positiveAction;
  }
  return classes.negativeAction;
};

const ActionsLog = ({ changesVector, socketId }) => {
  const { t } = useLanguage();

  return (
    <div className={classes.logContainer}>
      <p className={classes.logTitle}>{t("log.title")}</p>
      <div className={classes.logListWrapper}>
        <ul>
          {changesVector?.map((change, i) => (
            <li key={i} className={classes.logEntry}>
              <span className={classes.actionIcon}>
                {actionIcons[change.action] || "•"}
              </span>
              <p className={classes.logEntryText}>
                <span className={getActionImpact(socketId, change, classes)}>
                  {change.action === "passed"
                    ? (change.by === socketId ? t("log.you") : t("log.enemy")) +
                      " " +
                      change.action
                    : change.action === "newTurn"
                    ? t("log.newTurn")
                    : (change.owner === socketId ? t("log.your") : t("log.enemys")) +
                      " " +
                      change.name +
                      " " +
                      t(actionLogKeys[change.action]) +
                      (change.value ? " (" + change.value + ")" : "") +
                      (change.by ? " " + t("log.by") + " " + change.by : "") +
                      (change.row && change.col
                        ? " " + t("log.atRow") + " " + change.row + ", " + t("log.column") + " " + change.col
                        : "")}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActionsLog;
