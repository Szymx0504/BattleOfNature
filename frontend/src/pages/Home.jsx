import { Link } from "react-router-dom";

import classes from "./Home.module.css";

const HomePage = () => {
  return (
    <div className={classes.homeContainer}>
      <p className={classes.welcomeText}>Hello, welcome back!</p>
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
