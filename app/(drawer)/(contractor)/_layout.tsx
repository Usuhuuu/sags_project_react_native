import { useCallback, useMemo } from "react";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import {
  DrawerScreenConfig,
  renderDrawerScreens,
} from "@/hooks/util/drawer_screen";
import { useTheme } from "@/context/theme_context";
import { useCalendar } from "@/context/calendar_context";
import CustomDrawerContent from "@/components/ui/costum_drawer";
import type { DrawerContentComponentProps } from "expo-router/drawer";

export default function ContractorLayout() {
  const { colors: Colors } = useTheme();
  const { triggerCalendar } = useCalendar();
  const contractorScreens = useMemo<DrawerScreenConfig[]>(
    () => [
      { name: "booking_check", label: "Booking Check", icon: "calendar" },
      { name: "register_zaal", label: "Register Zaal", icon: "add" },
      { name: "statistical", label: "Stats", icon: "checkmark-circle" },
    ],
    [],
  );
  const renderDrawerContent = useCallback(
    (props: DrawerContentComponentProps) => <CustomDrawerContent {...props} />,
    [],
  );

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={renderDrawerContent}
    >
      <Drawer.Screen
        name="(tab-contractor)"
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
