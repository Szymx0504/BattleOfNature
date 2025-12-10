import classes from "./PtsBar.module.css";

const PtsBar = ({ curPts }) => {
  return (
    <div className={classes.ptsBarWrapper}>
    <div className={classes.ptsBarContent}> {/* <-- Uses .points-bar-content */}
        
        {/* The visual indicator for points (e.g., 3 points) */}
        {Array(10).fill().map((_, i) => (
            // This is the individual point square/indicator
            // We use conditional styling to show if the point is active (i < curPts)
            <div 
                key={i} 
                className={classes.SquareRepresentingAPoint} 
                style={{ opacity: i < curPts ? 1 : 0.3 }} // Example conditional styling
            >
                {/* Optional: You can put a number or icon here */}
            </div>
        ))}
        
        {/* The accompanying text */}
        <p>
            {curPts}/10 elixir
        </p>

    </div>
</div>
  );
};

export default PtsBar;
