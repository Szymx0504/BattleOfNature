import classes from "./ActionsLog.module.css";

const goodIfYours = ["heal"];
const badIfYours = ["death", "damageTaken"];
const neutral = ["place", "passed", "newTurn"];

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
  return (
    <div className={classes.logContainer}>
      <p className={classes.logTitle}>Actions Log</p>
      <div className={classes.logListWrapper}>
        <ul>
          {changesVector?.map((change, i) => (
            <li key={i}>
              <p className={classes.logEntryText}>
                <span className={getActionImpact(socketId, change, classes)}>
                  {change.action === "passed"
                    ? (change.by === socketId ? "You" : "Enemy") +
                      " " +
                      change.action
                    : change.action === "newTurn"
                    ? "New turn"
                    : (change.owner === socketId ? "Your" : "Enemy's") +
                      " " +
                      change.name +
                      ": " +
                      change.action +
                      " at row " +
                      change.row +
                      ", column " +
                      change.col}
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
