import * as Notifications from "expo-notifications";
import * as Calendar from "expo-calendar";
import { Platform } from "react-native";
import { useTheme } from "@/context/theme_context";
import { showToast } from "@/utils/toast";

const getDefaultCalendarSource = async () => {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
};
const createCalendar = async () => {
  const defaultSource =
    Platform.OS === "ios"
      ? await getDefaultCalendarSource()
      : { isLocalAccount: true, name: "Expo Calendar", type: "local" };

  const calendarId = await Calendar.createCalendarAsync({
    title: `Expo Calendar`,
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultSource.id,
    source: defaultSource,
    name: "Expo Calendar",
    ownerAccount: "personal",
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  console.log("Calendar created:", calendarId);
  return calendarId;
};

const createCalendarEvent = async ({
  calendarId,
  startDate,
  endDate,
}: {
  calendarId: string;
  startDate: Date;
  endDate: Date;
}) => {
  const eventId = await Calendar.createEventAsync(calendarId, {
    title: "Team Meeting",
    startDate,
    endDate,
    timeZone: "Asia/Seoul",
    location: "Ulaanbaatar Office",
  });
  console.log("Event created:", eventId);
  return { eventId, startDate };
};

const notificationCalendarEvent = async (start_time: Date) => {
  const triggerTime = new Date(start_time.getTime() - 10 * 10 * 1000); //10min
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📅 Upcoming Event",
      body: "Your meeting starts in 10 minutes!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
    },
  });
};

export const scheduleNotificationForEvent = async ({
  endDate,
  startDate,
}: {
  endDate: Date;
  startDate: Date;
}) => {
  const calendarId = await createCalendar();

  console.log(calendarId);
  const { eventId } = await createCalendarEvent({
    calendarId,
    endDate: endDate,
    startDate: startDate,
  });
  if (eventId) {
    console.log("success");
    showToast({
      title: "Successfully Added to Calendar",
      description: "You can check",
          alertType: "success",
    });
  }
  await notificationCalendarEvent(startDate);
  console.log("SDA");
};
