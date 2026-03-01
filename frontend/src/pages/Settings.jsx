import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import classes from "./Settings.module.css";

const Settings = () => {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className={classes.settingsContainer}>
      <button onClick={() => navigate("/")} className="goBackBtn">
        ← {t("ui.goBack")}
      </button>
      <h1 className={classes.settingsTitle}>{t("settings.title")}</h1>
      
      <div className={classes.settingsPanel}>
        <div className={classes.optionRow}>
          <span className={classes.optionLabel}>{t("settings.language")}</span>
          <div className={classes.buttonGroup}>
            <button
              className={`${classes.langButton} ${language === "en" ? classes.active : ""}`}
              onClick={() => changeLanguage("en")}
            >
              🇬🇧 English
            </button>
            <button
              className={`${classes.langButton} ${language === "pl" ? classes.active : ""}`}
              onClick={() => changeLanguage("pl")}
            >
              🇵🇱 Polski
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;