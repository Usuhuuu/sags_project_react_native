import React from "react";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import {
  DrawerScreenConfig,
  renderDrawerScreens,
} from "@/hooks/util/drawer_screen";
import { useTheme } from "@/context/theme_context";
import { useCalendar } from "@/context/calendar_context";
import CustomDrawerContent from "@/components/ui/costum_drawer";

export default function ContractorLayout() {
  const { colors: Colors } = useTheme();
  const { triggerCalendar } = useCalendar();
  const contractorScreens: DrawerScreenConfig[] = [
    {
      name: "booking_check",
      label: "Booking Check",
      icon: "calendar",
    },
    {
      name: "register_zaal",
      label: "Register Zaal",
      icon: "add",
    },
    {
      name: "statistical",
      label: "Stats",
      icon: "checkmark-circle",
    },
  ];
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="(tabs-contractor)"
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
        screens: contractorScreens,
        colors: Colors,
        triggerCalendar: triggerCalendar,
      })}
    </Drawer>
  );
}
