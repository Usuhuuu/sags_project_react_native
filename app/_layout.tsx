import "@/utils/i18";
import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Stack, router } from "expo-router";
import * as Sentry from "@sentry/react-native";
import * as Notifications from "expo-notifications";

import { Ionicons } from "@expo/vector-icons";
import { configureReanimatedLogger } from "react-native-reanimated";

import { ThemeProvider, useTheme } from "@/src/context/themeContext";
import { LanguageProvider } from "@/src/context/Languages";
import { AuthProvider } from "@/src/context/authContext";
import { SavedHallsProvider } from "@/src/context/savedHall";
import { CalendarProvider } from "@/src/context/CalendarContext";
import { CustomErrorBoundary } from "@/src/context/errorContext";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/hooks/queryClient";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NotifierRoot } from "react-native-notifier";

import {
  calendarPermission,
  cameraPermission,
  requestLocationPermission,
  reminderPermission,
} from "@/hooks/permissions";

import { useNotificationStore } from "@/src/context/store/notificationStore";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "/(tabs)/index",
};

configureReanimatedLogger({
  strict: false,
  level: 1,
});

Sentry.init({
  dsn: "https://c2284e34e20ae8c69ed3d05f8971fbb2@o4508263161856000.ingest.us.sentry.io/4508263165132800",
  tracesSampleRate: 1.0,
});

/* ----------------------------- */
/* ROOT LAYOUT (DO NOT WRAP)     */
/* ----------------------------- */

function RootLayout() {
  const [notificationData, setNotificationData] = useState<any>(null);

  useEffect(() => {
    const addNotification = useNotificationStore.getState().addNotification;

    const listener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const { title, body, data } = notification.request.content;

        const newNotification = {
          title: title ?? "New Notification",
          body: body ?? "You have a new message",
          timestamp: Date.now(),
        };

        await addNotification(newNotification);

        setNotificationData({
          title: newNotification.title,
          body: newNotification.body,
          data: { ...data, isLocal: true },
        });
      },
    );

    return () => listener.remove();
  }, []);

  useEffect(() => {
    calendarPermission();
    cameraPermission();
    requestLocationPermission();
    reminderPermission();
  }, []);

  return <RootLayoutNav />;
}

/* ----------------------------- */
/* NAVIGATION                    */
/* ----------------------------- */

function RootLayoutNav() {
  const { colors } = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)/index" />

      <Stack.Screen
        name="(modals)/authentication/login"
        options={{
          headerShown: true,
          headerTitle: "Login",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen
        name="listing/[sportHallID]"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="(modals)/chat/[item]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

/* ----------------------------- */
/* PROVIDERS (WRAP THIS ONLY)    */
/* ----------------------------- */

function AppProviders() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            {/*<NotifierRoot>*/}
            <CustomErrorBoundary>
              <AuthProvider>
                <LanguageProvider>
                  <SavedHallsProvider>
                    <CalendarProvider>
                      <RootLayout />
                    </CalendarProvider>
                  </SavedHallsProvider>
                </LanguageProvider>
              </AuthProvider>
            </CustomErrorBoundary>
            {/*</NotifierRoot>*/}
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const App = Sentry.wrap(AppProviders);

export default function Layout() {
  return <App />;
}
