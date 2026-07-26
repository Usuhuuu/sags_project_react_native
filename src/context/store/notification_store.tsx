import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

interface RawNotification {
  title: string;
  body: string;
  timestamp: number;
  seen?: boolean;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  seen: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  loadNotifications: () => Promise<void>;
  addNotification: (notif: RawNotification) => Promise<void>;
  seenNotification: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  removeNotifications: (ids: string[]) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  loadNotifications: async () => {
    const saved = await AsyncStorage.getItem("saved_notifications");
    const parsed: RawNotification[] = saved ? JSON.parse(saved) : [];
    const transformed = parsed.map((n, index) => ({
      id: String(n.timestamp ?? index),
      title: n.title ?? "Notification",
      body: n.body ?? "",
      time: String(n.timestamp),
      seen: n.seen ?? false,
    }));
    set({ notifications: transformed });
  },

  addNotification: async (notif: RawNotification) => {
    const saved = await AsyncStorage.getItem("saved_notifications");
    const parsed: RawNotification[] = saved ? JSON.parse(saved) : [];
    const updated = [notif, ...parsed].slice(0, 100);
    await AsyncStorage.setItem("saved_notifications", JSON.stringify(updated));
    set((state) => ({
      notifications: [
        {
          id: String(notif.timestamp),
          title: notif.title ?? "Notification",
          body: notif.body ?? "",
          time: String(notif.timestamp),
          seen: notif.seen ?? false,
        },
        ...state.notifications,
      ].slice(0, 100),
    }));
  },
  seenNotification: async (id: string) => {
    const saved = await AsyncStorage.getItem("saved_notifications");
    const parsed: RawNotification[] = saved ? JSON.parse(saved) : [];

    const updated = parsed.map((n) =>
      String(n.timestamp) === id ? { ...n, seen: true } : n,
    );

    await AsyncStorage.setItem("saved_notifications", JSON.stringify(updated));

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, seen: true } : n,
      ),
    }));
  },

  removeNotification: async (id: string) => {
    const saved = await AsyncStorage.getItem("saved_notifications");
    const parsed: RawNotification[] = saved ? JSON.parse(saved) : [];
    const updated = parsed.filter((n) => String(n.timestamp) !== id);
    await AsyncStorage.setItem("saved_notifications", JSON.stringify(updated));
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  removeNotifications: async (ids: string[]) => {
    const idSet = new Set(ids);
    const saved = await AsyncStorage.getItem("saved_notifications");
    const parsed: RawNotification[] = saved ? JSON.parse(saved) : [];
    const updated = parsed.filter((n) => !idSet.has(String(n.timestamp)));
    await AsyncStorage.setItem("saved_notifications", JSON.stringify(updated));
    set((state) => ({
      notifications: state.notifications.filter((n) => !idSet.has(n.id)),
    }));
  },

  clearNotifications: async () => {
    await AsyncStorage.removeItem("saved_notifications");
    set({ notifications: [] });
  },
}));

export const bookingNotificationSchedule = async ({
  title,
  body,
  bookingToken,
}: {
  title: string;
  body: string;
  bookingToken: string;
}) => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    for (const n of scheduled) {
      if (n.identifier?.startsWith(`booking-${bookingToken}`)) {
        console.log("cancelling scheduled notification", n.identifier);
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
    for (const time of [0, 5, 13]) {
      console.log("scheduling notification", `booking-${bookingToken}-${time}`);
      await Notifications.scheduleNotificationAsync({
        identifier: `booking-${bookingToken}-${time}`,
        content: { title: title, body: body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: time === 0 ? 1 : time * 60,
          repeats: false,
        },
      });
    }
  } catch (err) {
    console.log("Notification scheduling error:", err);
  }
};
