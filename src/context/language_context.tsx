import React, { createContext, useContext, useState, ReactNode } from "react";
import i18n from "i18next";
import { I18nextProvider } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LanguageContextProps {
  language: string;
  changeLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: i18n.language,
  changeLanguage: (lang: string) => {},
});

export const LanguageProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [language, setLanguage] = useState<string>(i18n.language);
  const [isLanguageChanged, setIsLanguageChanged] = useState<boolean>(false);

  const changeLanguage = async (lang: string) => {
    if (lang !== language) {
      i18n.changeLanguage(lang);
      setLanguage(lang);
      setIsLanguageChanged(true);
      await AsyncStorage.setItem("language", lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
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
