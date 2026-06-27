import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "@/components/ui/costum_drawer";
import { useTheme } from "@/context/theme_context";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DrawerScreenConfig,
  renderDrawerScreens,
} from "@/hooks/util/drawer_screen";
import { useCalendar } from "@/context/calendar_context";
import { Ionicons } from "@expo/vector-icons";

export default function UserLayout() {
  const { colors: Colors } = useTheme();
  const { triggerCalendar } = useCalendar();

  const userScreens: DrawerScreenConfig[] = [
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
  ];
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.backgroundColor }}
      edges={["left", "right", "bottom"]}
    >
      <Drawer
        screenOptions={{
          drawerLabelStyle: { marginLeft: -10 },
          drawerType: "slide",
        }}
        drawerContent={(props) => {
          return <CustomDrawerContent {...props} />;
        }}
      >
        <Drawer.Screen
          name="(tab-user)"
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
