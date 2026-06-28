import { useCallback, useEffect, useState } from "react";
import { configureReanimatedLogger } from "react-native-reanimated";
import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import { ThemeProvider } from "@/context/theme_context";
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
  requestLocationPermission,
  trackingStatusPermission,
} from "@/hooks/permissions";

// Keep splash visible while app initialises
SplashScreen.preventAutoHideAsync();

configureReanimatedLogger({
  strict: false,
  level: 1,
});

Sentry.init({
  dsn: "https://c2284e34e20ae8c69ed3d05f8971fbb2@o4508263161856000.ingest.us.sentry.io/4508263165132800",
  tracesSampleRate: 1.0,
});

export function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Request permissions while splash is visible (only once per install)
    notificationPermission();
    trackingStatusPermission();
    requestLocationPermission();

    // Wait one frame for contexts (theme, auth, etc.) to mount
    const frame = requestAnimationFrame(() => {
      setAppReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  return <RootLayoutNav onReady={onLayoutRootView} />;
}

export function RootLayoutNav({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return <Stack screenOptions={{ headerShown: false }}></Stack>;
}

export default Sentry.wrap(() => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <LanguageProvider>
            <NotifierRoot useRNScreensOverlay={true} />
            <AuthProvider>
              <CalendarProvider>
                <HallInfoProvider>
                  <RootLayout />
                </HallInfoProvider>
              </CalendarProvider>
            </AuthProvider>
          </LanguageProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  </ThemeProvider>
));
