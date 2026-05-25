import { useAuth } from "@/src/context/authContext";
import { useTheme } from "@/src/context/themeContext";
import ExploreHeader from "@/components/ExploreHeader";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";

const TabsLayout = () => {
  const { colors: Colors, theme } = useTheme();
  const { t } = useTranslation();
  const { LoginStatus } = useAuth();
  const bottomSheetY = useSharedValue(0);

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: Colors.themeColorTextSecondary,
        tabBarActiveTintColor: Colors.themeColorTextPure,
        headerShadowVisible: false,

        // 👇 Change image to icons
        tabBarStyle: {
          backgroundColor: Colors.containerColor,
          borderTopWidth: theme === "dark" ? 0 : 0,
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
      {/* ------------ HOME TAB ----------- */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: t("home"),
          headerShadowVisible: false,
          header: () => (
            <ExploreHeader
              onCategoryChanged={(category) => console.log(category)}
              bottomSheetY={bottomSheetY}
            />
          ),
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name="home-outline"
                size={28}
                color={
                  focused ? Colors.primary : Colors.themeColorTextSecondary
                }
              />
            );
          },
        }}
      />

      {/* ------------ INBOX TAB ----------- */}
      <Tabs.Screen
        name="inbox"
        options={{
          tabBarLabel: t("together"),
          headerTitle: t("together"),
          headerShadowVisible: false,
          headerTitleStyle: { color: Colors.primary, fontSize: 24 },
          headerRight: () => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={28}
              color={Colors.primary}
            />
          ),

          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={28}
                color={
                  focused ? Colors.primary : Colors.themeColorTextSecondary
                }
              />
            );
          },
        }}
      />

      {/* ------------ ORDER TAB ----------- */}
      <Tabs.Screen
        name="order"
        options={{
          tabBarLabel: t("myBookings"),
          headerTitle: t("myBookings"),
          headerShadowVisible: false,
          headerTitleAlign: "left",
          headerTitleStyle: { color: Colors.primary, fontSize: 28 },
          headerRight: () => (
            <Ionicons name="filter-outline" size={30} color={Colors.primary} />
          ),

          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name="filter-outline"
                size={30}
                color={
                  focused ? Colors.primary : Colors.themeColorTextSecondary
                }
              />
            );
          },
        }}
      />

      {/* ------------ FRIEND TAB ----------- */}
      <Tabs.Screen
        name="friend"
        options={{
          tabBarLabel: t("friends"),
          headerTitle: t("friends"),
          headerShadowVisible: false,
          headerTitleStyle: { color: Colors.primary, fontSize: 24 },

          headerRight: () => (
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={30}
              color={Colors.primary}
            />
          ),

          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name="people-outline"
                size={28}
                color={
                  focused ? Colors.primary : Colors.themeColorTextSecondary
                }
              />
            );
          },
        }}
      />

      {/* ------------ CHAT TAB ----------- */}
      <Tabs.Screen
        name="chat"
        options={{
          tabBarLabel: t("chat"),
          headerTitle: t("chat"),
          headerTitleStyle: { color: Colors.primary, fontSize: 24 },
          headerTitleAlign: "left",

          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 15, marginRight: 10 }}>
              <MaterialCommunityIcons
                name="text-search"
                size={28}
                color={Colors.primary}
              />
              <Ionicons
                name="chatbox-ellipses-outline"
                size={24}
                color={Colors.primary}
              />
            </View>
          ),

          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name="chatbox-ellipses-outline"
                size={28}
                color={
                  focused ? Colors.primary : Colors.themeColorTextSecondary
                }
              />
            );
          },
        }}
      />

      {/* ------------ PROFILE TAB ----------- */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: t("profile"),
          headerShown: false,
          // headerShown: !LoginStatus,
          // headerTitle: !LoginStatus ? t("aboutUs.login") : t("profile"),
          headerTitleStyle: { color: Colors.primary, fontSize: 24 },
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name="person-outline"
                size={28}
                color={
                  focused ? Colors.primary : Colors.themeColorTextSecondary
                }
              />
            );
          },
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
