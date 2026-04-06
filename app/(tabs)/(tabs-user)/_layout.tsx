import { useAuth } from "@/src/context/authContext";
import { useTheme } from "@/src/context/themeContext";
import ExploreHeader from "@/components/ExploreHeader";
import {
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
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
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Image
                source={require("@/assets/tab-icons/home.png")}
                style={{ width: 26, height: 26 }}
              />
            </View>
          ),
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
            <Image
              source={require("@/assets/tab-icons/teamwork.png")}
              style={{ width: 26, height: 26, marginRight: 10 }}
            />
          ),

          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Image
                source={require("@/assets/tab-icons/teamwork.png")}
                style={{ width: 26, height: 26 }}
              />
            </View>
          ),
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
            <TouchableOpacity
              onPress={() => {
                router.push("/friend");
              }}
            >
              <Ionicons
                name="filter-circle-outline"
                size={28}
                color={Colors.primary}
              />
            </TouchableOpacity>
          ),

          tabBarIcon: () => (
            <FontAwesome
              name="address-book-o"
              size={24}
              color={Colors.primary}
            />
          ),
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

          headerRight: () => {
            return (
              <TouchableOpacity style={{ marginRight: 10 }}>
                <MaterialIcons
                  name="person-add"
                  size={30}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            );
          },

          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Image
                source={require("@/assets/tab-icons/friends.png")}
                style={{ width: 28, height: 28 }}
              />
            </View>
          ),
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
              <TouchableOpacity
                onPress={() => router.push("/(modals)/cameraModal")}
              >
                <Entypo name="new-message" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ),

          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Image
                source={require("@/assets/tab-icons/chat.png")}
                style={{ width: 30, height: 30 }}
              />
            </View>
          ),
        }}
      />

      {/* ------------ PROFILE TAB ----------- */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: t("profile"),
          headerShown: !LoginStatus,
          headerTitle: !LoginStatus ? t("aboutUs.login") : t("profile"),
          headerTitleStyle: { color: Colors.primary, fontSize: 24 },
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                padding: 5,
                borderRadius: 20,
                backgroundColor: focused ? Colors.primary : "transparent",
              }}
            >
              <Image
                source={require("@/assets/tab-icons/athlete.png")}
                style={{ width: 28, height: 28 }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
