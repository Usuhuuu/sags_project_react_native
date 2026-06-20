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

configureReanimatedLogger({
  strict: false,
  level: 1,
});

Sentry.init({
  dsn: "https://c2284e34e20ae8c69ed3d05f8971fbb2@o4508263161856000.ingest.us.sentry.io/4508263165132800",
  tracesSampleRate: 1.0,
});

export function RootLayout() {
  return <RootLayoutNav />;
}

export function RootLayoutNav() {
  return <Stack screenOptions={{ headerShown: false }}></Stack>;
}

export default Sentry.wrap(() => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NotifierRoot useRNScreensOverlay={true} />
        <AuthProvider>
          <HallInfoProvider>
            <RootLayout />
          </HallInfoProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  </ThemeProvider>
));
