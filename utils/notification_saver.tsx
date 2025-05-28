import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the type if not imported from elsewhere
type SimpleNotificationContent = {
  // Add the expected properties, for example:
  title: string;
  message: string;
  [key: string]: any;
};

const saveNotification = async (notification: SimpleNotificationContent) => {
  try {
    const existing = await AsyncStorage.getItem("notifications");
    const parsed = existing ? JSON.parse(existing) : [];

    const updated = [notification, ...parsed];
    await AsyncStorage.setItem("notifications", JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save notification", err);
  }
};
