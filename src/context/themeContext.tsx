import { LightTheme, DarkTheme, ThemeColors } from "@/constants/Colors";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeProps {
  theme: "light" | "dark";
  colors: ThemeColors;
  changeTheme: (theme: "light" | "dark") => void;
}

export const ThemeContext = createContext<ThemeProps | null>(null);

const THEME_STORAGE_KEY = "user_theme_preference";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const deviceTheme = useColorScheme();
  //  (deviceTheme as "light" | "dark") ??
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    console.log(theme);
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      }
    };
    loadTheme();
  }, []);

  const changeTheme = async (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };
  const colors = theme === "light" ? LightTheme : DarkTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("ThemeContext is missing");
  return ctx;
};
