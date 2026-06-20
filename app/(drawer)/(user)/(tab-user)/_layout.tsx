import { useTheme } from "@/context/theme_context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";

export default function TabLayout() {
  const { colors, theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: colors.themeColorTextSecondary,
        tabBarActiveTintColor: colors.themeColorTextPure,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.containerColor,
          borderTopWidth: theme === "dark" ? 0 : 0,
          borderTopColor: colors.containerColor,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={[colors.backgroundColor, colors.primary]}
            start={{ x: 0, y: 0.7 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ),
        headerStyle: {
          backgroundColor: colors.backgroundColor,
        },
        headerTintColor: colors.themeColorTextPure,
        headerTitleStyle: { color: colors.primary },
        freezeOnBlur: true,
        lazy: true,
      }}
    >
      <Tabs.Screen name="" />
    </Tabs>
  );
}
