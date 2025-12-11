import "@/utils/i18";
import "react-native-reanimated";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { router, Stack, useRouter } from "expo-router";
import React, { useEffect, ReactNode, useState } from "react";
import { TouchableOpacity, View, ActivityIndicator } from "react-native";
import * as Sentry from "@sentry/react-native";
import { LanguageProvider } from "./(modals)/context/Languages";
export { ErrorBoundary } from "expo-router";
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "./(modals)/context/authContext";
import { SavedHallsProvider } from "@/app/(modals)/context/savedHall";
import Layout, { TabsLayout } from "./(tabs)/_layout";
import { CustomErrorBoundary } from "./(modals)/context/errorContext";
import * as Notifications from "expo-notifications";
import { CalendarProvider } from "@/app/(modals)/context/CalendarContext";
import { mutate } from "swr";
import { useNotificationStore } from "./(modals)/context/store/notificationStore";
import {
  Notifier,
  NotifierComponents,
  NotifierRoot,
} from "react-native-notifier";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  calendarPermission,
  cameraPermission,
  requestLocationPermission,
  reminderPermission,
} from "@/hooks/permissions";
import { ThemeProvider, useTheme } from "./(modals)/context/themeContext";

export const unstable_settings = {
  initialRouteName: "/(tabs)",
};

Sentry.init({
  dsn: "https://c2284e34e20ae8c69ed3d05f8971fbb2@o4508263161856000.ingest.us.sentry.io/4508263165132800",
  tracesSampleRate: 1.0,
});

type SimpleNotificationContent = {
  title: string;
  body: string;
  data?: any;
};

export function RootLayout({ children }: { children: ReactNode }) {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [fontError, setFontError] = useState<boolean>(false);
  const { LoginStatus } = useAuth();
  const { colors: Colors } = useTheme();

  useEffect(() => {
    if (error) {
      Sentry.captureException(error);
      console.error("Error loading fonts:", error);
      setFontError(true);
      Notifier.showNotification({
        title: "Error loading fonts",
        description: "Please try again later",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
    }
  }, [error, loaded]);

  const [notificationData, setNotificationData] =
    useState<SimpleNotificationContent | null>(null);

  // Notification Section
  useEffect(() => {
    const addNotification = useNotificationStore.getState().addNotification;

    const listener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const { title, body, data } = notification.request.content;
        const timestamp = Date.now();

        const newNotification = {
          title: typeof title === "string" ? title : "New Notification",
          body: typeof body === "string" ? body : "You have a new message",
          timestamp,
        };

        try {
          await addNotification(newNotification);
          console.log("Notification saved to Zustand and AsyncStorage");
        } catch (error) {
          console.error("Failed to save notification:", error);
        }

        // Optional: trigger SWR revalidation if needed
        if (data?.success && data?.fetch) {
          mutate(["User_Friend", LoginStatus], undefined, { revalidate: true });
        }

        // Optionally update local state for immediate UI updates
        setNotificationData((prev) => {
          if (
            prev?.title === title &&
            prev?.body === body &&
            JSON.stringify(prev?.data) === JSON.stringify(data)
          ) {
            return prev; // Skip duplicate
          }

          return {
            title: newNotification.title,
            body: newNotification.body,
            data: {
              ...data,
              isLocal: true,
            },
          };
        });
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { data } = response.notification.request.content;
        if (data?.targetScreen) {
          router.push(data.targetScreen);
        }
      });

    return () => {
      listener.remove();
      responseListener.remove();
    };
  }, []);

  Notifications.setNotificationHandler({
    handleNotification: async () => {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });
  useEffect(() => {
    if (notificationData) {
      if (notificationData.data?.isLocal) return;
      Notifications.scheduleNotificationAsync({
        content: {
          title: notificationData.title,
          body: notificationData.body,
          data: {
            ...notificationData.data,
            isLocal: true,
          },
          sound: "default",
          badge: 1,
        },
        trigger: null,
      });
      console.log("Notification data:", notificationData);
    }
  }, [notificationData]);

  useEffect(() => {
    calendarPermission();
    cameraPermission();
    requestLocationPermission();
    reminderPermission();
  }, []);

  if (!loaded || fontError) {
    // Show a loading/fallback UI if fonts are still loading or if there's an error
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <RootLayoutNav />;
}

export function RootLayoutNav() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors: Colors } = useTheme();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modals)/authentication/login"
        options={{
          headerTitle: "Burtguuleh",
          headerTitleAlign: "left",
          animation: "slide_from_bottom",
          presentation: "modal",
          headerTintColor: Colors.primary,
          headerShown: true,
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color={Colors.primary} />
              </TouchableOpacity>
            );
          },
        }}
      />

      <Stack.Screen
        name="listing/[sportHallID]"
        options={{ headerTitle: " " }}
      />

      <Stack.Screen
        name="listing/notification"
        options={{
          headerShown: true,
          title: `${t("Notifications")}`,
          headerStyle: { backgroundColor: Colors.backgroundColor },
          headerTitleStyle: { fontSize: 28, color: Colors.primary },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="(modals)/chat/[item]"
        options={{
          headerTintColor: Colors.primary,
          headerStyle: { backgroundColor: Colors.backgroundColor },
          headerTitleStyle: { fontSize: 28, color: Colors.primary },
          animation: "fade",
          headerShown: false,
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color={Colors.primary} />
              </TouchableOpacity>
            );
          },
          headerRight: () => {
            return (
              <TouchableOpacity>
                <Ionicons />
              </TouchableOpacity>
            );
          },
        }}
      />
      <Stack.Screen
        name="listing/book/[zaal_id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(modals)/user/[friend_name]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="listing/review/[zaalReview]"
        options={{
          headerTitle: "Sport Hall Review",
          headerStyle: { backgroundColor: Colors.backgroundColor },
          headerTitleStyle: { fontSize: 28, color: Colors.primary },
          headerRight: () => (
            <TouchableOpacity>
              <AntDesign name="edit" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="listing/review/util/inner_zaal_review"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.backgroundColor },
          headerTitleStyle: { fontSize: 28, color: Colors.primary },
          headerShadowVisible: false,
          headerTitle: "Zaal Review",
        }}
      />
    </Stack>
  );
}

export default Sentry.wrap(() => (
  <ThemeProvider>
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <NotifierRoot useRNScreensOverlay={true} />
        <CustomErrorBoundary>
          <AuthProvider>
            <LanguageProvider>
              <SavedHallsProvider>
                <CalendarProvider>
                  <RootLayout>
                    <Layout />
                    <TabsLayout />
                  </RootLayout>
                </CalendarProvider>
              </SavedHallsProvider>
            </LanguageProvider>
          </AuthProvider>
        </CustomErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  </ThemeProvider>
));
