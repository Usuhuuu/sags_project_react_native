import { useAuth } from "@/app/(modals)/context/authContext";
import { useTheme } from "@/app/(modals)/context/themeContext";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

const TabsLayout = () => {
  const { colors: Colors, theme } = useTheme();
  const { t } = useTranslation();
  const { LoginStatus } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: Colors.themeColorTextSecondary,
        tabBarActiveTintColor: Colors.themeColorTextPure,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: Colors.containerColor,
          borderTopWidth: 1,
          borderTopColor: Colors.containerColor,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={[Colors.backgroundColor, Colors.primary]}
            start={{ x: 0, y: 0.7 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ),
        headerStyle: { backgroundColor: Colors.backgroundColor },
        headerTintColor: Colors.themeColorTextPure,
        headerTitleStyle: { color: Colors.primary },
      }}
    >
      <Tabs.Screen
        name="orders"
        options={{
          tabBarLabel: "Orders",
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
