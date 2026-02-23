import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

import classes from "./Home.module.css";

const HomePage = () => {
  const { t } = useLanguage();
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
      <p className={classes.welcomeText}>{t("home.welcome")}</p>
      {serverStats && (
        <div className={classes.statsWrapper}>
          <div className={classes.statCard}>
            <span className={classes.statValue}>
              {serverStats.playersOnline}
            </span>
            <span className={classes.statLabel}>{t("home.playersOnline")}</span>
          </div>
          <div className={classes.statCard}>
            <span className={classes.statValue}>{serverStats.activeGames}</span>
            <span className={classes.statLabel}>{t("home.activeGames")}</span>
          </div>
        </div>
      )}
      <div className={classes.linkContainer}>
        <Link to="/play" className={classes.navLink}>
          {t("home.play")}
        </Link>
        <Link to="/rules" className={classes.navLink}>
          {t("home.rules")}
        </Link>
        <Link to="/cards" className={classes.navLink}>
          {t("home.cards")}
        </Link>
        <Link to="/settings" className={classes.navLink}>
          {t("home.settings")}
        </Link>
        <Link to="/updates" className={classes.navLink}>
          {t("home.updates")}
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
