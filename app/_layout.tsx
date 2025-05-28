import "@/utils/i18";
import "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { router, Stack, useRouter } from "expo-router";
import React, { useEffect, ReactNode, useState, useRef } from "react";
import { TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import * as Sentry from "@sentry/react-native";
import Colors from "@/constants/Colors";
import { LanguageProvider } from "./(modals)/context/Languages";
export { ErrorBoundary } from "expo-router";
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "./(modals)/context/authContext";
import { SavedHallsProvider } from "@/app/(modals)/context/savedHall";
import Layout, { TabsLayout } from "./(tabs)/_layout";
import { CustomErrorBoundary } from "./(modals)/context/errorContext";
import * as Notifications from "expo-notifications";
import { CalendarProvider } from "@/interfaces/CalendarContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mutate } from "swr";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

Sentry.init({
  dsn: "https://c2284e34e20ae8c69ed3d05f8971fbb2@o4508263161856000.ingest.us.sentry.io/4508263165132800",
  tracesSampleRate: 1.0,
});

interface RootLayoutProps {
  children: ReactNode;
}
type SimpleNotificationContent = {
  title: string;
  body: string;
  data?: any;
};

function RootLayout({ children }: RootLayoutProps) {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [fontError, setFontError] = useState<boolean>(false);
  const { LoginStatus } = useAuth();

  useEffect(() => {
    if (error) {
      Sentry.captureException(error);
      console.error("Error loading fonts:", error);
      setFontError(true);
      Alert.alert("Error loading fonts", "Please try again later");
    }
  }, [error, loaded]);

  const [notificationData, setNotificationData] =
    useState<SimpleNotificationContent | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const notificationResponseListener =
    useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(async (notification) => {
        const { title, body, data } = notification.request.content;
        console.log("lalar", notification.request.content);

        if (data.success && data.fetch) {
          mutate(["User_Friend", LoginStatus], undefined, { revalidate: true });
        }
        const newNotification = {
          title: typeof title === "string" ? title : "New Notification",
          body: typeof body === "string" ? body : "You have a new message",
          timestamp: Date.now(),
        };
        try {
          const existing = await AsyncStorage.getItem("saved_notifications");
          const parsed = existing ? JSON.parse(existing) : [];
          parsed.push(newNotification);
          await AsyncStorage.setItem(
            "saved_notifications",
            JSON.stringify(parsed)
          );
          console.log("Notification saved");
        } catch (error) {
          console.error("Failed to save notification:", error);
        }

        setNotificationData((prev) => {
          // Avoid setting the same data repeatedly
          if (
            prev?.title === title &&
            prev?.body === body &&
            JSON.stringify(prev?.data) === JSON.stringify(data)
          ) {
            return prev;
          }

          return {
            title: typeof title === "string" ? title : "New Notification",
            body: typeof body === "string" ? body : "You have a new message",
            data: {
              ...data,
              isLocal: true,
            },
          };
        });
      });

    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { data } = response.notification.request.content;
        if (data.targetScreen) {
          router.push(data.targetScreen);
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
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

function RootLayoutNav() {
  const router = useRouter();
  const { t } = useTranslation();

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
        name="(modals)/sags"
        options={{
          title: "sags",
          presentation: "transparentModal",
          animation: "fade",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-outline" size={28} />
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen
        name="listing/notification"
        options={{
          headerShown: true,
          title: `${t("Notifications")}`,
          headerTitleStyle: { fontSize: 28, color: Colors.primary },
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
    </Stack>
  );
}

export default Sentry.wrap(() => (
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
));
