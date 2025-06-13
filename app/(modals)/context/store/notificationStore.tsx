import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
