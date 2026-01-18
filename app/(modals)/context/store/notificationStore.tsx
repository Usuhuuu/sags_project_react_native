import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

interface RawNotification {
  title: string;
  body: string;
  timestamp: number;
}

interface Notification {
  id: string;
  message: string;
  time: string;
}

interface NotificationStore {
  notifications: Notification[];
  loadNotifications: () => Promise<void>;
  addNotification: (notif: RawNotification) => Promise<void>;
  clearNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  loadNotifications: async () => {
    const saved = await AsyncStorage.getItem("saved_notifications");
    const parsed: RawNotification[] = saved ? JSON.parse(saved) : [];
    const transformed = parsed.map((n, index) => ({
      id: String(n.timestamp ?? index),
      message: `${n.title ?? "Notification"}: ${n.body ?? ""}`,
      time: new Date(n.timestamp).toLocaleString(),
    }));
    set({ notifications: transformed });
  },

  addNotification: async (notif: RawNotification) => {
    const saved = await AsyncStorage.getItem("saved_notifications");
    const parsed: RawNotification[] = saved ? JSON.parse(saved) : [];
    const updated = [notif, ...parsed];
    await AsyncStorage.setItem("saved_notifications", JSON.stringify(updated));
    set((state) => ({
      notifications: [
        {
          id: String(notif.timestamp),
          message: `${notif.title ?? "Notification"}: ${notif.body ?? ""}`,
          time: new Date(notif.timestamp).toLocaleString(),
        },
        ...state.notifications,
      ],
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
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
    for (const time of [0, 5, 13]) {
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
