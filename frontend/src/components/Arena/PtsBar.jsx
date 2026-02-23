import classes from "./PtsBar.module.css";

const PtsBar = ({ curPts, turnNumber }) => {
  const barLimit = Math.max(
    curPts,
    turnNumber === 0 ? 5 : turnNumber <= 12 ? 10 : 15
  );
  return (
    <div className={classes.ptsBarWrapper}>
      <div className={classes.ptsBarContent}>
        <div className={classes.ptsLabel}>
          <span className={classes.ptsIcon}>✦</span>
          <span className={classes.ptsText}>
            {curPts}/{barLimit}
          </span>
          <span className={classes.ptsName}>elixir</span>
        </div>
        <div className={classes.gemsRow}>
          {Array(barLimit)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                className={`${classes.gem} ${i < curPts ? classes.gemActive : classes.gemSpent}`}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default PtsBar;
