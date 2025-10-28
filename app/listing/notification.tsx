import React, { useEffect, useState } from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Colors from "@/constants/Colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SwipeableRow from "./book/support_components/swipe_remove";

// Define NotificationItem type
type NotificationItem = {
  id: string;
  message: string;
  time: string;
};

const NotificationScreen = () => {
  const { t } = useTranslation();
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
              borderColor: Colors.primary,
              borderTopWidth: 1,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    justifyContent: "space-between",
    backgroundColor: Colors.light,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    backgroundColor: Colors.secondary,
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 8,

    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 5,
  },
  notificationItem: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    margin: 10,

    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationText: {
    flex: 1,
    marginLeft: 10,
  },
  notificationMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  notificationTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  footer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: Colors.primary,
  },
  footerButtonText: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  texts: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NotificationScreen;
