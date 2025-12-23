import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import classes from "./Home.module.css";

const HomePage = () => {
  const [serverStats, setServerStats] = useState();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/players");
        const data = await response.json();
        setServerStats(data);
      } catch (error) {
        console.log("Error fetching server stats", error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={classes.homeContainer}>
      <p className={classes.welcomeText}>Hello, welcome back!</p>
      {serverStats && (
        <div className={classes.statsWrapper}>
          <div className={classes.statCard}>
            <span className={classes.statValue}>
              {serverStats.playersOnline}
            </span>
            <span className={classes.statLabel}>players online</span>
          </div>
          <div className={classes.statCard}>
            <span className={classes.statValue}>{serverStats.activeGames}</span>
            <span className={classes.statLabel}>active games</span>
          </div>
        </div>
      )}
      <div className={classes.linkContainer}>
        {/* Note: Links need a 'to' prop to work correctly in React Router */}
        <Link to="/play" className={classes.navLink}>
          Play
        </Link>
        <Link to="/rules" className={classes.navLink}>
          Rules
        </Link>
        <Link to="/cards" className={classes.navLink}>
          Cards
        </Link>
        <Link to="/settings" className={classes.navLink}>
          Settings
        </Link>{" "}
        {/* Added a path and label */}
        <Link to="/updates" className={classes.navLink}>
          Updates
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
