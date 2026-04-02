import { useTheme } from "@/src/context/themeContext";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import {
  BarChart2,
  Calendar,
  Home,
  MoreHorizontal,
  User,
} from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

const TabsLayout = () => {
  const { colors: Colors, theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: Colors.themeColorTextSecondary,
        tabBarActiveTintColor: Colors.themeColorTextPure,
        headerShadowVisible: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.containerColor,
          borderTopWidth: theme === "dark" ? 0 : 1,
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

        headerStyle: {
          backgroundColor: Colors.backgroundColor,
        },
        headerTintColor: Colors.themeColorTextPure,
        headerTitleStyle: { color: Colors.primary },
      }}
    >
      <Tabs.Screen
        name="overview"
        options={{
          headerTitle: "Overview",

          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Home size={22} color={Colors.themeColorTextPure} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="statistic"
        options={{
          tabBarLabel: "Statistic",
          headerShadowVisible: false,

          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <BarChart2 size={24} color={Colors.themeColorTextPure} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarLabel: "Booking",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Calendar size={22} color={Colors.themeColorTextPure} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <User size={22} color={Colors.themeColorTextPure} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "more",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <MoreHorizontal size={24} color={Colors.themeColorTextPure} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
