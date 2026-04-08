import React from "react";
import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "@/components/CostumDrawerContent";
import { useTheme } from "@/src/context/themeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DrawerScreenConfig,
  renderDrawerScreens,
} from "@/src/utils/render_drawer_screen";
import { useCalendar } from "@/src/context/CalendarContext";
import { Ionicons } from "@expo/vector-icons";

export default function UserLayout() {
  const { colors: Colors } = useTheme();
  const { triggerCalendar } = useCalendar();

  const userScreens: DrawerScreenConfig[] = [
    {
      name: "info",
      label: "Information",
      icon: "person",
      headerShown: false,
    },
    {
      name: "settings",
      label: "Settings",
      icon: "settings",
      headerLeft: true,
    },
    {
      name: "(sub_settings)/settings_notification",
      label: "Notification",
      icon: "notifications",
      headerLeft: true,
      hidden: false,
    },
    {
      name: "index",
      label: "Index",
      icon: "home",
      headerShown: false,
      hidden: false,
    },
  ];
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.backgroundColor }}
      edges={["left", "right", "bottom"]}
    >
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerLabelStyle: { marginLeft: -10 },
          drawerType: "slide",
        }}
      >
        <Drawer.Screen
          name="(tabs-user)"
          options={{
            drawerActiveTintColor: Colors.primary,
            drawerInactiveTintColor: Colors.themeColorTextPure,
            drawerLabel: "Home",
            headerShown: false,
            drawerIcon: ({ color }) => (
              <Ionicons name="home" size={24} color={color} />
            ),
          }}
        />
        {renderDrawerScreens({
          screens: userScreens,
          colors: Colors,
          triggerCalendar: triggerCalendar,
        })}
      </Drawer>
    </SafeAreaView>
  );
}
