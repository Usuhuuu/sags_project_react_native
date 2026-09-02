import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/theme_context";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
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
        lazy: true,
        freezeOnBlur: true,
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
              <Ionicons
                name="home-outline"
                size={22}
                color={Colors.themeColorTextPure}
              />
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
              <Ionicons
                name="bar-chart-outline"
                size={22}
                color={Colors.themeColorTextPure}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="order"
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
              <Ionicons
                name="calendar-outline"
                size={22}
                color={Colors.themeColorTextPure}
              />
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
              <Ionicons
                name="person-outline"
                size={22}
                color={Colors.themeColorTextPure}
              />
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
              <Ionicons
                name="ellipsis-horizontal-outline"
                size={22}
                color={Colors.themeColorTextPure}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
