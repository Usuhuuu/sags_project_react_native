import React, { useEffect, useState } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SwipeableRow from "./book/support_components/swipe_remove";
import { useTheme } from "../(modals)/context/themeContext";

// Define NotificationItem type
type NotificationItem = {
  id: string;
  message: string;
  time: string;
};

const NotificationScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },

    footer: {
      padding: 20,
      alignItems: "center",
      backgroundColor: colors.backgroundColor,
      borderTopWidth: 1,
      borderTopColor: colors.primary,
    },
    footerButtonText: {
      color: colors.primary,
      fontWeight: "bold",
    },
    texts: {
      color: "#000",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
  const [savedNotifications, setSavedNotifications] = useState<
    NotificationItem[]
  >([]);

  const deleteNotification = async (id: string) => {
    const saved = await AsyncStorage.getItem("saved_notifications");
    const parsed = saved ? JSON.parse(saved) : [];

    const updated = parsed.filter((item: any) => String(item.timestamp) !== id);

    await AsyncStorage.setItem("saved_notifications", JSON.stringify(updated));

    // Update the local state too
    setSavedNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const getSavedNotifications = async () => {
    const saved = await AsyncStorage.getItem("saved_notifications");
    const parsed = saved ? JSON.parse(saved) : [];
    const transformed = parsed.map((n: any, index: number) => ({
      id: String(n.timestamp ?? index),
      message: n.message ?? `${n.title ?? "Notification"}: ${n.body ?? ""}`,
      time: n.time ?? new Date(n.timestamp).toLocaleString(),
    }));
    setSavedNotifications(transformed);
  };

  useEffect(() => {
    getSavedNotifications();

    const subscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const { title, body } = notification.request.content;
        const timestamp = Date.now();

        const newNotification = {
          title,
          body,
          timestamp,
        };

        // Save to AsyncStorage
        const saved = await AsyncStorage.getItem("saved_notifications");
        const parsed = saved ? JSON.parse(saved) : [];
        const updated = [newNotification, ...parsed];
        await AsyncStorage.setItem(
          "saved_notifications",
          JSON.stringify(updated)
        );

        // Update UI state
        setSavedNotifications((prev) => [
          {
            id: String(timestamp),
            message: `${title ?? "Notification"}: ${body ?? ""}`,
            time: new Date(timestamp).toLocaleString(),
          },
          ...prev,
        ]);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <FlatList
            data={savedNotifications}
            contentContainerStyle={{
              top: 10,
            }}
            renderItem={({ item }) => (
              <SwipeableRow
                item={item}
                onDelete={() => deleteNotification(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
          />
          <View style={styles.footer}>
            <Text style={styles.footerButtonText}>google ad</Text>
          </View>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default NotificationScreen;
