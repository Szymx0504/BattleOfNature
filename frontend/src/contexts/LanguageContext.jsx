import { createContext, useContext, useState, useEffect, useCallback } from "react";
import translations from "../data/translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }, []);

  const t = useCallback((key, replacements = {}) => {
    let text = translations[language]?.[key] || translations.en?.[key] || key;
    for (const [placeholder, value] of Object.entries(replacements)) {
      text = text.replace(`{${placeholder}}`, value);
    }
    return text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
