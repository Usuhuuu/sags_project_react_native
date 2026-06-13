import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { FlatList, View, StyleSheet, TouchableOpacity } from "react-native";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import SwipeableRow from "@/src/utils/notification/swipe_remove";
import { useTheme } from "@/src/context/themeContext";
import AppText from "@/constants/appTextDefault";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { useNotificationStore } from "@/src/context/store/notificationStore";

const STORAGE_KEY = "saved_notifications";

export type NotificationItem = {
  id: string;
  message: { title: string; body: string };
  time: string;
  seen: boolean;
};

// ── Transform raw storage data once ────────────────────────────────────────
const toNotificationItem = (raw: any, index: number): NotificationItem => ({
  id: String(raw.timestamp ?? index),
  message: {
    title: raw.title ?? "Notification",
    body: raw.body ?? "",
  },
  time: raw.timestamp,
  seen: raw.seen ?? false,
});

// ── Styles (created once) ──────────────────────────────────────────────────
const createStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.backgroundColor },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: Colors.surfaceHigh,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    footerBtn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
    },
    footerBtnText: {
      color: "#EF4444",
      fontSize: 14,
      fontWeight: "700",
    },
    footerDivider: {
      width: 1,
      height: 24,
      backgroundColor: Colors.border,
    },
  });

// ── Shared static styles (no Colors dependency) ───────────────────────────
const sharedStyles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});

// ── Empty state (memoized) ─────────────────────────────────────────────────
const EmptyNotificationScreen = React.memo(() => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        sharedStyles.emptyContainer,
        { backgroundColor: colors.backgroundColor },
      ]}
    >
      <View
        style={[
          sharedStyles.emptyIconBox,
          { backgroundColor: colors.accentPrimaryGlow },
        ]}
      >
        <Feather name="bell-off" size={36} color={colors.accentPrimary} />
      </View>
      <AppText style={[sharedStyles.emptyTitle, { color: colors.onSurface }]}>
        No notifications yet
      </AppText>
      <AppText style={[sharedStyles.emptySubtitle, { color: colors.outline }]}>
        We'll notify you about maintenance, payments, and system updates here.
      </AppText>
    </View>
  );
});

// ── Component ──────────────────────────────────────────────────────────────
const NotificationScreen = () => {
  const { t } = useTranslation();
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const { seenNotification } = useNotificationStore();
  const navigation = useNavigation();

  const [savedNotifications, setSavedNotifications] = useState<
    NotificationItem[]
  >([]);
  const [selectReady, setSelectReady] = useState(false);
  const [selectedList, setSelectedList] = useState<string[]>([]);

  // ── Load saved notifications ──
  const loadNotifications = useCallback(async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setSavedNotifications(parsed.map(toNotificationItem));
    } catch {}
  }, []);

  // ── Delete single ──
  const deleteNotification = useCallback(async (id: string) => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      const updated = parsed.filter(
        (item: any) => String(item.timestamp) !== id,
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedNotifications((prev) => prev.filter((item) => item.id !== id));
    } catch {}
  }, []);

  // ── Delete selected ──
  const deleteSelected = useCallback(async () => {
    if (selectedList.length === 0) {
      Notifier.showNotification({
        title: "No notifications selected",
        description: "Please select notifications to delete.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "warn" },
      });
      return;
    }
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      const updated = parsed.filter(
        (item: any) => !selectedList.includes(String(item.timestamp)),
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedNotifications((prev) =>
        prev.filter((item) => !selectedList.includes(item.id)),
      );
    } catch {}
    setSelectedList([]);
    setSelectReady(false);
  }, [selectedList]);

  // ── Delete all ──
  const deleteAll = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSavedNotifications([]);
    setSelectedList([]);
    setSelectReady(false);
  }, []);

  // ── On mount ──
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // ── Listen for new notifications ──
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        const { title, body } = notification.request.content;
        const timestamp = Date.now();

        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        const newItem = { title, body, timestamp, seen: false };
        const updated = [newItem, ...parsed];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        setSavedNotifications((prev) => [
          {
            id: String(timestamp),
            message: { title: title ?? "Notification", body: body ?? "" },
            time: String(timestamp),
            seen: false,
          },
          ...prev,
        ]);
      },
    );
    return () => subscription.remove();
  }, []);

  // ── Header right button ──
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        selectReady ? (
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={() => setSelectReady(false)}
          >
            <Feather name="x-circle" size={24} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{ marginRight: 16 }}
            onPress={() => setSelectReady(true)}
          >
            <Ionicons name="trash-sharp" size={24} color={Colors.primary} />
          </TouchableOpacity>
        ),
    });
  }, [navigation, selectReady, Colors.primary]);

  // ── FlatList optimizations ──
  const keyExtractor = useCallback((item: NotificationItem) => item.id, []);
  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <SwipeableRow
        item={item}
        itemSave={seenNotification}
        onDelete={() => deleteNotification(item.id)}
        selectReady={selectReady}
        setSelectReady={setSelectReady}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
      />
    ),
    [seenNotification, deleteNotification, selectReady, selectedList],
  );
  const listEmpty = useCallback(() => <EmptyNotificationScreen />, []);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={savedNotifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        windowSize={7}
        maxToRenderPerBatch={15}
        removeClippedSubviews
        initialNumToRender={10}
      />
      {selectReady && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerBtn} onPress={deleteSelected}>
            <AppText style={styles.footerBtnText}>Delete Selected</AppText>
          </TouchableOpacity>
          <View style={styles.footerDivider} />
          <TouchableOpacity style={styles.footerBtn} onPress={deleteAll}>
            <AppText style={styles.footerBtnText}>Delete All</AppText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;
