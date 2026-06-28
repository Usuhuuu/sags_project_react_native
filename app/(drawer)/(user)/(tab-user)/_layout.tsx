import { useTheme } from "@/context/theme_context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

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
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "home",
          headerShadowVisible: false,
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name="home-outline"
                size={28}
                color={
                  focused ? colors.primary : colors.themeColorTextSecondary
                }
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          tabBarLabel: "order",
          headerTitle: "book",
          headerShadowVisible: false,
          headerTitleAlign: "left",
          headerTitleStyle: { color: colors.primary, fontSize: 28 },
          headerRight: () => (
            <Ionicons name="filter-outline" size={30} color={colors.primary} />
          ),
          tabBarIcon: ({ focused }) => {
            return (
              <Ionicons
                name="filter-outline"
                size={30}
                color={
                  focused ? colors.primary : colors.themeColorTextSecondary
                }
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
