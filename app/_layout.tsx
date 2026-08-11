import { useCallback, useEffect, useState } from "react";
import { configureReanimatedLogger } from "react-native-reanimated";
import { router, Stack } from "expo-router";
import { ThemeProvider, useTheme } from "@/context/theme_context";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotifierRoot } from "react-native-notifier";
import { AuthProvider } from "@/context/auth_context";
import HallInfoProvider from "@/context/hall_info_context";
import { queryClient } from "@/hooks/queryClient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/hooks/i18n_instance";
import { LanguageProvider } from "@/context/language_context";
import { CalendarProvider } from "@/context/calendar_context";
import * as SplashScreen from "expo-splash-screen";
import {
  notificationPermission,
  reminderPermission,
  requestLocationPermission,
  trackingStatusPermission,
} from "@/hooks/permissions";
import { useNotificationStore } from "@/context/store/notification_store";
import * as Notifications from "expo-notifications";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { mqttService } from "@/hooks/mqttInstance";

// Keep splash visible while app initialises
SplashScreen.preventAutoHideAsync();

configureReanimatedLogger({
  strict: false,
  level: 1,
});

export function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializePermissions = async () => {
      await Promise.allSettled([
        notificationPermission(),
        trackingStatusPermission(),
        requestLocationPermission(),
        reminderPermission(),
        mqttService.connect(),
      ]);

      if (mounted) {
        setAppReady(true);
      }
    };

    initializePermissions();

    return () => {
      mounted = false;
      mqttService.disconnect();
    };
  }, []);

  useEffect(() => {
    const addNotification = useNotificationStore.getState().addNotification;

    const subscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const { title, body, data } = notification.request.content;

        try {
          await addNotification({
            title: typeof title === "string" ? title : "New Notification",

            body:
              typeof body === "string" ? body : "You have a new notification",

            timestamp: Date.now(),
          });

          if (data?.success && data?.fetch) {
            queryClient.invalidateQueries({
              queryKey: ["auth_friend"],
            });
          }
        } catch (error) {
          console.error("Failed to process notification", error);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (!appReady) return;

    await SplashScreen.hideAsync();
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return <RootLayoutNav onReady={onLayoutRootView} />;
}

export function RootLayoutNav({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="notification/notification"
        options={{
          headerShown: true,
          title: "Notifications",
          headerStyle: {
            backgroundColor: colors.backgroundColor,
          },
          headerTitleStyle: {
            fontSize: 24,
            color: colors.primary,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="book/esport/[hall_id]" />
      <Stack.Screen name="book/sport/[hall_id]" />
      <Stack.Screen name="book/[hall_id]" />
      <Stack.Screen name="review/hall_review" />
      <Stack.Screen name="server_error" />
    </Stack>
  );
}

export default () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LanguageProvider>
            <AuthProvider>
              <CalendarProvider>
                <HallInfoProvider>
                  <NotifierRoot useRNScreensOverlay />
                  <RootLayout />
                </HallInfoProvider>
              </CalendarProvider>
            </AuthProvider>
          </LanguageProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  </ThemeProvider>
);
