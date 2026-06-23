import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "@/assets/language/en.json";
import mn from "@/assets/language/mn.json";
import kr from "@/assets/language/kr.json";

const lng = getLocales()[0]?.languageCode || "en";

const getLanguageFromStorage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem("language");
    return storedLanguage || getLocales()[0]?.languageCode || "en";
  } catch (err) {
    console.log("Error loading language:", err);
    return "en";
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en.data },
    mn: { translation: mn.data },
    kr: { translation: kr.data },
  },
  lng: lng,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
});

getLanguageFromStorage().then((language) => {
  i18n.changeLanguage(language);
});

export default i18n;
