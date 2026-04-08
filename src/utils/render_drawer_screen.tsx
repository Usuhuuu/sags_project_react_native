import React from "react";
import Drawer from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Image, View } from "react-native";
import { router } from "expo-router";

export type DrawerScreenConfig = {
  name: string;
  icon?: keyof typeof Ionicons.glyphMap;
  label?: string;
  headerShown?: boolean;
  headerLeft?: boolean;
  headerRight?: "edit" | "calendar";
  hidden?: boolean;
  options?: any;
};
export function renderDrawerScreens({
  screens,
  colors,
  triggerCalendar,
}: {
  screens: DrawerScreenConfig[];
  colors: any;
  triggerCalendar?: () => void;
}) {
  return screens.map((screen) => (
    <Drawer.Screen
      key={screen.name}
      name={screen.name}
      options={{
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.themeColorTextPure,

        drawerLabel: screen.label ?? screen.name,
        headerShown: screen.headerShown ?? true,
        drawerItemStyle: {
          display: screen?.hidden === false ? "none" : "flex",
        },
        drawerIcon: () =>
          screen.icon ? (
            <Ionicons name={screen.icon} size={24} color={colors.primary} />
          ) : null,

        // 🔥 BACK BUTTON CONTROL
        headerLeft: screen.headerLeft
          ? () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={28}
                  color={colors.primary}
                  style={{ marginLeft: 15 }}
                />
              </TouchableOpacity>
            )
          : undefined,

        // 🔥 RIGHT BUTTON CONTROL
        headerRight:
          screen.headerRight === "edit"
            ? () => (
                <TouchableOpacity onPress={() => console.log("Edit Profile")}>
                  <Ionicons
                    name="create-outline"
                    size={24}
                    color={colors.primary}
                    style={{ marginRight: 15 }}
                  />
                </TouchableOpacity>
              )
            : screen.headerRight === "calendar"
              ? () => (
                  <TouchableOpacity onPress={triggerCalendar}>
                    <View>
                      <Image
                        source={require("@/assets/sport-icons/calendar.png")}
                        style={{ width: 24, height: 24, marginRight: 15 }}
                      />
                    </View>
                  </TouchableOpacity>
                )
              : undefined,

        headerTitle: screen.label ?? screen.name,
        headerTitleStyle: {
          color: colors.primary,
          fontSize: 24,
        },
        headerStyle: {
          backgroundColor: colors.backgroundColor,
        },
        headerShadowVisible: false,

        ...screen.options,
      }}
    />
  ));
}
