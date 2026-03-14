import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  FlatList,
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SwipeableRow from "./components/swipe_remove";
import { useTheme } from "../../(modals)/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Notifier, NotifierComponents } from "react-native-notifier";

// Define NotificationItem type
export type NotificationItem = {
  id: string;
  message: {
    title: string;
    body: string;
  };
  time: string;
  seen: boolean;
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
    footerDeleteButtons: {
      width: "50%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    footerDeleteText: {
      color: "red",
    },
  });
  const [savedNotifications, setSavedNotifications] = useState<
    NotificationItem[]
  >([]);
  const [selectReady, setSelectReady] = useState<boolean>(false);
  const [selectedList, setSelectedList] = useState<string[]>([]);

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
      message: {
        title: n.title ?? "Notification",
        body: n.body ?? "",
      },
      time: n.timestamp,
      seen: n.seen ?? false,
    }));
    transformed.map((s: any) => console.log(s.seen));
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
          seen: false,
        };

        // Save to AsyncStorage
        const saved = await AsyncStorage.getItem("saved_notifications");
        const parsed = saved ? JSON.parse(saved) : [];
        const updated = [newNotification, ...parsed];
        await AsyncStorage.setItem(
          "saved_notifications",
          JSON.stringify(updated),
        );

        // Update UI state
        setSavedNotifications((prev) => [
          {
            id: String(timestamp),
            message: {
              title: title ?? "Notification",
              body: body ?? "",
            },
            time: new Date(timestamp).toLocaleString(),
            seen: false,
          },
          ...prev,
        ]);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        selectReady ? (
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={() => setSelectReady(false)}
          >
            <Feather name="x-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={() => {
              setSelectReady(true);
            }}
          >
            <Ionicons name="trash-sharp" size={24} color={colors.primary} />
          </TouchableOpacity>
        ),
    });
  }, [navigation, selectReady]);
  const { width } = Dimensions.get("window");

  const deleteAll = async () => {
    if (selectedList.length === 0)
      Notifier.showNotification({
        title: "No notifications selected",
        description: "Please select notifications to delete.",
        Component: NotifierComponents.Alert,
        componentProps: {
          alertType: "warn",
        },
      });
    const saved = await AsyncStorage.getItem("saved_notifications");
    const parsed = saved ? JSON.parse(saved) : [];
    if (parsed.length === 0) return;
    await AsyncStorage.removeItem("saved_notifications");
    setSavedNotifications([]);
    setSelectedList([]);
    setSelectReady(false);
  };
  const deleteSelected = async () => {
    if (selectedList.length === 0)
      Notifier.showNotification({
        title: "No notifications selected",
        description: "Please select notifications to delete.",
        Component: NotifierComponents.Alert,
        componentProps: {
          alertType: "warn",
        },
      });
    const saved = await AsyncStorage.getItem("saved_notifications");
    const parsed = saved ? JSON.parse(saved) : [];
    if (parsed.length === 0) return;
    const updated = parsed.filter(
      (item: any) => !selectedList.includes(String(item.timestamp)),
    );
    await AsyncStorage.setItem("saved_notifications", JSON.stringify(updated));
    setSavedNotifications((prev) =>
      prev.filter((item) => !selectedList.includes(String(item.id))),
    );
    setSelectedList([]);
    setSelectReady(false);
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <FlatList
            data={savedNotifications}
            contentContainerStyle={{
              top: 10,
            }}
            renderItem={({ item }) => (
              <SwipeableRow
                item={item}
                onDelete={() => deleteNotification(item.id)}
                selectReady={selectReady}
                setSelectReady={setSelectReady}
                selectedList={selectedList}
                setSelectedList={setSelectedList}
              />
            )}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={() => <EmptyNotificationScreen />}
          />
          {selectReady && (
            <View
              style={[
                styles.footer,
                {
                  backgroundColor: colors.containerColor,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  width: width,
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.footerDeleteButtons, {}]}
                onPress={() => {
                  deleteSelected();
                  setSelectedList([]);
                }}
              >
                <Text
                  style={[styles.footerDeleteText, { fontSize: width * 0.04 }]}
                >
                  Delete Selected
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerDeleteButtons, {}]}
                onPress={() => {
                  deleteAll();
                  setSelectedList([]);
                }}
              >
                <Text
                  style={[styles.footerDeleteText, { fontSize: width * 0.04 }]}
                >
                  Delete All
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
function EmptyNotificationScreen() {
  const { colors } = useTheme();
  const { width, height } = Dimensions.get("screen");
  return (
    <View
      style={{
        width: width,
        height: height,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: width * 0.3,
            height: width * 0.3,
            marginBottom: 20,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            backgroundColor: colors.containerColor,
          }}
        >
          <Feather
            name="bell-off"
            size={width * 0.2}
            color={colors.themeColorTextPure}
          />
        </View>
        <View
          style={{
            alignItems: "center",
            gap: 8,
            width: "60%",
            justifyContent: "center",
          }}
        >
          <AppText style={{ fontSize: 22, fontWeight: "500" }}>
            No notification yet
          </AppText>
          <AppText style={{ color: colors.darkGrey, fontSize: 14 }}>
            We will notify you about for maintenance, payments, and system
            updates here.
          </AppText>
        </View>
      </View>
    </View>
  );
}

export default NotificationScreen;
