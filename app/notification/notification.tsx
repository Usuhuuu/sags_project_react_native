import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { FlatList, View, StyleSheet, TouchableOpacity } from "react-native";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import SwipeableRow from "@/components/notification/swipe_remove";
import { useTheme } from "@/context/theme_context";
import AppText from "@/components/ui/app_text";
import { Feather, Ionicons } from "@expo/vector-icons";
import { showToast } from "@/utils/toast";
import { useNotificationStore } from "@/context/store/notification_store";
import { useNavigation } from "expo-router";

export type NotificationItem = {
  id: string;
  message: { title: string; body: string };
  time: string;
  seen: boolean;
};

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
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, lineHeight: 20, textAlign: "center" },
});

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

const NotificationScreen = () => {
  const { t } = useTranslation();
  const { colors: Colors } = useTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const navigation = useNavigation();

  // ── Single source of truth: Zustand store ─────────────────────────────────
  const storeNotifications = useNotificationStore((s) => s.notifications);
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);
  const seenNotification = useNotificationStore((s) => s.seenNotification);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const removeNotifications = useNotificationStore(
    (s) => s.removeNotifications,
  );
  const clearNotifications = useNotificationStore((s) => s.clearNotifications);

  // Transform store shape → NotificationItem shape expected by SwipeableRow
  const savedNotifications = useMemo<NotificationItem[]>(
    () =>
      storeNotifications.map((n) => ({
        id: n.id,
        message: { title: n.title, body: n.body },
        time: n.time,
        seen: n.seen,
      })),
    [storeNotifications],
  );

  const [selectReady, setSelectReady] = useState(false);
  const [selectedList, setSelectedList] = useState<string[]>([]);

  // ── Hydrate store from AsyncStorage once on mount ─────────────────────────
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // ── Mutations — all go through the store ──────────────────────────────────
  const deleteNotification = useCallback(
    async (id: string | number) => {
      await removeNotification(String(id));
    },
    [removeNotification],
  );

  const deleteSelected = useCallback(async () => {
    if (selectedList.length === 0) {
      showToast({
        title: "No notifications selected",
        description: "Please select notifications to delete.",
          alertType: "warn",
      });
      return;
    }
    await removeNotifications(selectedList);
    setSelectedList([]);
    setSelectReady(false);
  }, [selectedList, removeNotifications]);

  const deleteAll = useCallback(async () => {
    await clearNotifications();
    setSelectedList([]);
    setSelectReady(false);
  }, [clearNotifications]);

  // ── Header ────────────────────────────────────────────────────────────────
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

  // ── FlatList ──────────────────────────────────────────────────────────────
  const keyExtractor = useCallback((item: NotificationItem) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <SwipeableRow
        item={item}
        itemSave={seenNotification}
        onDelete={deleteNotification}
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
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
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
