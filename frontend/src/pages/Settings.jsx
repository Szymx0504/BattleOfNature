import classes from "./Settings.module.css";

const Settings = () => {
  return (
    <div className={classes.settingsContainer}>
      <h1 className={classes.settingsTitle}>Settings</h1>
      
      <div className={classes.settingsPanel}>
        <div className={classes.comingSoonText}>
          <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '10px' }}>
            🌊
          </span>
          The tides are shifting... 
          <br />
          Coming soon
        </div>

        {/* Zakomentowane sekcje na przyszłość z lekkim stylem */}
        {/* <div className={classes.optionRow}>
           <span>Languages</span>
           <button disabled>English</button>
           <button disabled>Polish</button>
        </div> 
        */}
      </div>
    </div>
  );
};

export default Settings;