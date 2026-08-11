import { useTheme } from "@/context/theme_context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function TabLayout() {
  const { colors, theme } = useTheme();
  const styles = React.useMemo(() => createTabStyle(colors), [colors]) as any;
  return (
    <Tabs
      screenOptions={{
        tabBarInactiveTintColor: colors.themeColorTextSecondary,
        tabBarActiveTintColor: colors.themeColorTextPure,

        lazy: true,

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
      }}
    >
      {/* ORDER */}
      <Tabs.Screen
        name="order"
        options={{
          tabBarLabel: "Order",

          headerTitle: "Book",
          headerTitleAlign: "left",

          headerTitleStyle: {
            color: colors.primary,
            fontSize: 28,
            fontWeight: "700",
          },

          headerRight: () => (
            <Ionicons
              name="filter-outline"
              size={26}
              color={colors.primary}
              style={{
                marginRight: 18,
              }}
            />
          ),

          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              styles={styles}
              inactiveColor={colors.themeColorTextSecondary}
              icon={focused ? "calendar" : "calendar-outline"}
            />
          ),
        }}
      />

      {/* TOGETHER */}
      <Tabs.Screen
        name="together"
        options={{
          tabBarLabel: "Together",
          headerShown: false,

          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              styles={styles}
              inactiveColor={colors.themeColorTextSecondary}
              icon={focused ? "people" : "people-outline"}
            />
          ),
        }}
      />

      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",

          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              styles={styles}
              inactiveColor={colors.themeColorTextSecondary}
              icon={focused ? "home" : "home-outline"}
            />
          ),
        }}
      />

      {/* FAVORITES */}
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarLabel: "Favorites",

          headerTitle: "Favorites",
          headerTitleAlign: "left",

          headerTitleStyle: {
            color: colors.primary,
            fontSize: 28,
            fontWeight: "700",
          },

          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              styles={styles}
              inactiveColor={colors.themeColorTextSecondary}
              icon={focused ? "heart" : "heart-outline"}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          headerShown: false,

          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              styles={styles}
              inactiveColor={colors.themeColorTextSecondary}
              icon={focused ? "person" : "person-outline"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
function TabIcon({
  focused,
  inactiveColor,
  icon,
  styles,
}: {
  focused: boolean;
  inactiveColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  styles: ReturnType<typeof createTabStyle>;
}) {
  return (
    <View style={focused ? styles.activeDoubleBorder : undefined}>
      <View style={focused ? styles.homeButton : styles.iconContainer}>
        <Ionicons name={icon} size={24} color={inactiveColor} />
      </View>
    </View>
  );
}

const createTabStyle = (colors: any) => ({
  homeButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 1,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  iconContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  activeDoubleBorder: {
    backgroundColor: colors.backgroundColor,
    borderRadius: 30,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    height: 60,
    width: 60,
    marginTop: -10,
  },
  inactiveDoubleBorder: {},
});
